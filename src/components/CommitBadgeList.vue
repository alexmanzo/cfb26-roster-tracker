<script setup lang="ts">
import type { Commit } from '../types/roster';
import CommitBadge from './CommitBadge.vue';

defineProps<{
  commits: Commit[];
  athPending: boolean;
}>();

const emit = defineEmits<{
  'remove-commit': [commitId: string];
}>();
</script>

<template>
  <div class="flex flex-wrap gap-1.5 items-center min-h-[28px]">
    <CommitBadge
      v-for="commit in commits"
      :key="commit.id"
      :commit="commit"
      @remove-commit="(id) => emit('remove-commit', id)"
    />

    <!-- Ghost badge when ATH flag is pending: pulsing dashed indicator -->
    <span
      v-if="athPending"
      class="inline-flex items-center gap-1 px-2 py-[5px] rounded-[3px] font-jetbrains text-[13px] font-bold border border-dashed border-blue-400/40 bg-blue-500/10 text-blue-300/50 leading-none animate-pulse"
      title="ATH pending — press 1–5 to add commit"
    >
      <span>?</span>
      <span class="text-[11px] tracking-wider">ATH</span>
    </span>

    <span
      v-if="commits.length === 0 && !athPending"
      class="text-zinc-700 text-sm font-jetbrains"
    >—</span>
  </div>
</template>
