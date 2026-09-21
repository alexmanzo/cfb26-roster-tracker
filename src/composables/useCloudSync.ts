import { nextTick, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
import type { RosterState } from '../types/roster';

export type SyncStatus = 'off' | 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 800;
const NEVER = new Date(0).toISOString();

/**
 * Mirrors the roster state to Supabase for the signed-in user.
 * localStorage stays the source of truth while signed out; on sign-in the
 * newer of local vs cloud wins, then every local change is pushed (debounced).
 */
export function useCloudSync(state: Ref<RosterState>) {
  const status = ref<SyncStatus>('off');
  const { user } = useAuth();

  // Tracked separately from state so bumping it doesn't retrigger the deep watcher.
  const localUpdatedAt = useLocalStorage<string>('cfb26-roster-updated-at', NEVER);

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let applyingRemote = false;

  async function push() {
    if (!supabase || !user.value) return;
    status.value = 'saving';
    // A roster that predates timestamp tracking has no stamp yet — give it one now
    // so it isn't treated as older than everything by other devices.
    if (localUpdatedAt.value === NEVER) localUpdatedAt.value = new Date().toISOString();
    const updatedAt = localUpdatedAt.value;
    const { error } = await supabase
      .from('rosters')
      .upsert({ user_id: user.value.id, data: state.value, updated_at: updatedAt });
    if (error) {
      console.error('[cloud-sync] save failed', error);
      status.value = 'error';
    } else {
      status.value = 'saved';
    }
  }

  function schedulePush() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(push, SAVE_DEBOUNCE_MS);
  }

  async function pull() {
    if (!supabase || !user.value) return;
    status.value = 'saving';
    const { data, error } = await supabase
      .from('rosters')
      .select('data, updated_at')
      .eq('user_id', user.value.id)
      .maybeSingle();

    if (error) {
      console.error('[cloud-sync] load failed', error);
      status.value = 'error';
      return;
    }

    if (data && new Date(data.updated_at) > new Date(localUpdatedAt.value)) {
      // Watchers flush asynchronously, so hold the guard until after they run.
      applyingRemote = true;
      state.value = data.data as RosterState;
      localUpdatedAt.value = data.updated_at;
      await nextTick();
      applyingRemote = false;
      status.value = 'saved';
    } else {
      // No cloud copy yet, or local is newer — make the cloud match local.
      await push();
    }
  }

  watch(
    state,
    () => {
      if (applyingRemote) return;
      localUpdatedAt.value = new Date().toISOString();
      if (user.value) schedulePush();
    },
    { deep: true }
  );

  watch(
    user,
    (u) => {
      if (saveTimer) clearTimeout(saveTimer);
      if (u) pull();
      else status.value = 'off';
    },
    { immediate: true }
  );

  return { status };
}
