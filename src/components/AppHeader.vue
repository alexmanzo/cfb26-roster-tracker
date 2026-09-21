<script setup lang="ts">
import AccountMenu from './AccountMenu.vue';
import { useRosterStore, ROSTER_LIMIT } from '../composables/useRosterStore';

const { rosterTotals } = useRosterStore();

defineEmits<{
  reset: [];
  'reset-srtr': [];
  'reset-commits': [];
}>();
</script>

<template>
  <header class="h-14 sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 shrink-0">
    <!-- Tricolor top accent: offense blue → defense red → special teams green -->
    <div class="absolute inset-x-0 top-0 h-[2px]" style="background: linear-gradient(to right, #3b82f6 0%, #3b82f6 48%, #ef4444 48%, #ef4444 80%, #22c55e 80%, #22c55e 100%); opacity: 0.7;" />

    <div class="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-6">

      <!-- Brand mark -->
      <div class="flex items-center gap-3 shrink-0">
        <div class="flex items-center gap-2">
          <span class="font-barlow text-[26px] font-bold tracking-tight text-white leading-none">CFB26</span>
          <div class="w-px h-4 bg-zinc-700 self-center" />
          <div class="flex flex-col leading-none gap-0.5">
            <span class="font-barlow text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase">Roster</span>
            <span class="font-barlow text-[10px] font-semibold tracking-[0.18em] text-zinc-600 uppercase">Tracker</span>
          </div>
        </div>

        <!-- Roster totals against the 85-man limit -->
        <div class="flex items-center gap-4 pl-4 border-l border-zinc-800">
          <div class="flex items-baseline gap-1.5" :title="`${rosterTotals.total} of ${ROSTER_LIMIT} roster spots filled now`">
            <span class="font-jetbrains tabular-data text-base leading-none" :class="rosterTotals.total > ROSTER_LIMIT ? 'text-red-400' : 'text-zinc-100'">{{ rosterTotals.total }}</span>
            <span class="font-jetbrains tabular-data text-[11px] text-zinc-600 leading-none">/{{ ROSTER_LIMIT }}</span>
            <span class="font-barlow text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase leading-none">Roster</span>
          </div>
          <div class="flex items-baseline gap-1.5" :title="`${rosterTotals.projected} of ${ROSTER_LIMIT} after seniors/transfers leave and commits arrive`">
            <span class="font-jetbrains tabular-data text-base leading-none" :class="rosterTotals.projected > ROSTER_LIMIT ? 'text-red-400' : rosterTotals.projected < rosterTotals.total ? 'text-orange-300/80' : 'text-zinc-100'">{{ rosterTotals.projected }}</span>
            <span class="font-jetbrains tabular-data text-[11px] text-zinc-600 leading-none">/{{ ROSTER_LIMIT }}</span>
            <span class="font-barlow text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase leading-none">Projected</span>
          </div>
        </div>
      </div>

      <!-- Keyboard shortcut legend -->
      <div class="hidden lg:flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">1–5</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">commit</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">A</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">ATH</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border border-zinc-700 text-zinc-500 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-150"
          @click="$emit('reset-srtr')"
          title="Set all SR/TR values to 0"
        >
          Reset SR/TR
        </button>
        <button
          class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border border-zinc-700 text-zinc-500 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-150"
          @click="$emit('reset-commits')"
          title="Clear all commits"
        >
          Reset Commits
        </button>
        <button
          class="px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-150"
          @click="$emit('reset')"
          title="Reset all data to defaults"
        >
          Reset
        </button>
        <AccountMenu />
      </div>
    </div>
  </header>
</template>
