<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { useAuth } from '../composables/useAuth';
import { useRosterStore } from '../composables/useRosterStore';

const { user, ready, isEnabled, isSignedIn, sendMagicLink, signOut } = useAuth();
const { syncStatus } = useRosterStore();

const open = ref(false);
const email = ref('');
const sending = ref(false);
const sentTo = ref<string | null>(null);
const error = ref<string | null>(null);
const panel = ref<HTMLElement | null>(null);

onClickOutside(panel, () => { open.value = false; });
onKeyStroke('Escape', () => { open.value = false; });

watch(open, (isOpen) => {
  if (!isOpen) { error.value = null; }
});

watch(isSignedIn, (signedIn) => {
  if (signedIn) { open.value = false; sentTo.value = null; email.value = ''; }
});

const statusLabel = computed(() => {
  switch (syncStatus.value) {
    case 'saving': return 'Saving';
    case 'saved': return 'Saved';
    case 'error': return 'Not saved';
    default: return 'Synced';
  }
});

const statusDotClass = computed(() => {
  switch (syncStatus.value) {
    case 'saving': return 'bg-amber-400 animate-pulse';
    case 'error': return 'bg-red-500';
    default: return 'bg-green-500';
  }
});

async function submit() {
  const value = email.value.trim();
  if (!value) return;
  sending.value = true;
  error.value = null;
  const err = await sendMagicLink(value);
  sending.value = false;
  if (err) {
    error.value = err;
  } else {
    sentTo.value = value;
  }
}
</script>

<template>
  <div v-if="isEnabled && ready" ref="panel" class="relative shrink-0">
    <!-- Signed in: status + email + sign out -->
    <div v-if="isSignedIn" class="flex items-center gap-3 pl-3 border-l border-zinc-800">
      <div class="flex items-center gap-2" :title="`${statusLabel} to the cloud`">
        <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass" />
        <span class="hidden md:inline text-[11px] text-zinc-400 max-w-[180px] truncate">{{ user?.email }}</span>
      </div>
      <button
        class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border border-zinc-700 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-all duration-150"
        @click="signOut"
      >
        Sign out
      </button>
    </div>

    <!-- Signed out: sign-in trigger -->
    <div v-else class="pl-3 border-l border-zinc-800">
      <button
        class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border transition-all duration-150"
        :class="open
          ? 'border-blue-500/60 text-blue-300 bg-blue-500/10'
          : 'border-zinc-700 text-zinc-500 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/5'"
        :aria-expanded="open"
        @click="open = !open"
      >
        Sign in
      </button>
    </div>

    <!-- Magic link panel -->
    <Transition
      enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in motion-reduce:transition-none"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open && !isSignedIn"
        class="absolute right-0 top-full mt-2 w-72 rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/50 p-4"
      >
        <template v-if="sentTo">
          <p class="font-barlow text-base font-semibold text-zinc-100 leading-tight">Check your inbox</p>
          <p class="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
            A sign-in link is on its way to <span class="text-zinc-200">{{ sentTo }}</span>. Open it on this device to finish.
          </p>
          <button
            class="mt-3 text-[11px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
            @click="sentTo = null"
          >
            Use a different email
          </button>
        </template>

        <form v-else @submit.prevent="submit">
          <p class="font-barlow text-base font-semibold text-zinc-100 leading-tight">Keep your roster everywhere</p>
          <p class="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
            Sign in to save this roster to the cloud and load it on any browser. We'll email you a link — no password.
          </p>
          <div class="mt-3 flex gap-1.5">
            <input
              v-model="email"
              v-focus
              type="email"
              name="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="min-w-0 flex-1 px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500/60 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              :disabled="sending"
              class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded bg-blue-500/15 border border-blue-500/40 text-blue-200 hover:bg-blue-500/25 disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {{ sending ? 'Sending' : 'Send link' }}
            </button>
          </div>
          <p v-if="error" class="mt-2 text-[11px] text-red-400 leading-snug">{{ error }}</p>
        </form>
      </div>
    </Transition>
  </div>
</template>
