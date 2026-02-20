<script setup lang="ts">
defineEmits<{
  reset: [];
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
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">Del</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">undo</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">↑↓</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">rows</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">←→</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">players</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">Enter</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">edit/save</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">Esc</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">cancel</span>
        </div>
        <span class="text-zinc-700 text-xs">·</span>
        <div class="flex items-center gap-1.5">
          <kbd class="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-zinc-800 border border-zinc-700 font-jetbrains text-[10px] text-zinc-200 shadow-[0_1px_0_0_#52525b] leading-none font-medium">Click</kbd>
          <span class="text-[11px] text-zinc-500 leading-none">select row</span>
        </div>
      </div>

      <!-- Reset -->
      <button
        class="shrink-0 px-3 py-1.5 font-barlow text-xs font-semibold tracking-wider uppercase rounded border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-150"
        @click="$emit('reset')"
        title="Reset all data to defaults"
      >
        Reset
      </button>
    </div>
  </header>
</template>
