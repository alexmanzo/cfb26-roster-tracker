<script setup lang="ts">
import { computed } from 'vue';
import type { Commit } from '../types/roster';

const props = defineProps<{
  commit: Commit;
}>();

const emit = defineEmits<{
  'remove-commit': [commitId: string];
}>();

const STAR_STYLES = [
  null, // index 0 unused
  { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/60', label: '★' },
  { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/60', label: '★★' },
  { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/60', label: '★★★' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/60', label: '★★★★' },
  { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/60', label: '★★★★★' },
];

const style = computed(() => STAR_STYLES[props.commit.stars] ?? STAR_STYLES[1]!);
</script>

<template>
  <div class="relative group/commit inline-flex items-center">
    <span
      class="inline-flex items-center gap-1 px-2 py-[5px] rounded-[3px] font-jetbrains text-[13px] font-bold border leading-none"
      :class="[style.bg, style.text, style.border, commit.isAth ? 'border-dashed' : 'border-solid']"
      :title="`${commit.stars}★ recruit${commit.isAth ? ' (ATH)' : ''}`"
    >
      <span class="tracking-tight">{{ style.label }}</span>
      <span v-if="commit.isAth" class="text-[11px] font-semibold opacity-90 tracking-wider">ATH</span>
    </span>
    <button
      class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-zinc-700 text-zinc-300 text-[9px] leading-none items-center justify-center hidden group-hover/commit:flex hover:bg-red-500 hover:text-white transition-colors z-10"
      @click.stop="emit('remove-commit', commit.id)"
      tabindex="-1"
      title="Remove"
    >×</button>
  </div>
</template>
