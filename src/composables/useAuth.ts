import { ref, computed } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const user = ref<User | null>(null);
const ready = ref(false);
let _initialized = false;

function init() {
  if (_initialized || !supabase) {
    ready.value = true;
    return;
  }
  _initialized = true;

  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user ?? null;
    ready.value = true;
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
  });
}

export function useAuth() {
  init();

  const isEnabled = computed(() => supabase !== null);
  const isSignedIn = computed(() => user.value !== null);

  async function sendMagicLink(email: string): Promise<string | null> {
    if (!supabase) return 'Cloud sync is not configured.';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      // Trailing slash so it matches the allow-listed URLs exactly.
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return error ? error.message : null;
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return { user, ready, isEnabled, isSignedIn, sendMagicLink, signOut };
}
