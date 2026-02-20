<script setup lang="ts">
import type { PositionSuperGroup, SuperGroupDerivedStats } from '../types/roster';
import EditableCell from './EditableCell.vue';

const props = defineProps<{
  sg: PositionSuperGroup;
  derived: SuperGroupDerivedStats;
  memberLabels: string[];
}>();

const emit = defineEmits<{
  'update:target': [sgId: string, value: number];
}>();

function needClass(need: number): string {
  if (need > 0) return 'text-red-400 font-bold';
  return 'text-emerald-400';
}

function needBg(need: number): string {
  if (need > 0) return 'bg-red-500/10';
  return '';
}
</script>

<template>
  <tr class="border-t-2 border-t-zinc-700/50 border-b border-b-zinc-700/40 bg-zinc-800/20">
    <!-- Position label -->
    <td class="px-3 py-2 whitespace-nowrap border-l-2 border-zinc-600/50">
      <div class="flex flex-col gap-0.5">
        <span class="font-barlow font-bold text-[17px] tracking-wide leading-none text-zinc-300">
          {{ sg.label }}
        </span>
        <span class="font-jetbrains text-[10px] text-zinc-600 tracking-wide leading-none">
          {{ memberLabels.join(' · ') }}
        </span>
      </div>
    </td>

    <!-- Total (combined) -->
    <td class="px-3 py-2 text-center font-jetbrains tabular-data text-base text-zinc-500">
      {{ derived.total }}
    </td>

    <!-- SR/TR (combined, read-only) -->
    <td class="px-3 py-2 text-center font-jetbrains tabular-data text-base text-zinc-600">
      {{ derived.srTrSum }}
    </td>

    <!-- Projected (combined) -->
    <td
      class="px-3 py-2 text-center font-jetbrains tabular-data text-base"
      :class="derived.projected < sg.target ? 'text-orange-300/70' : 'text-zinc-500'"
    >
      {{ derived.projected }}
    </td>

    <!-- Target (group-level, editable) -->
    <td class="px-2 py-1.5 text-center" @click.stop>
      <EditableCell :value="sg.target" @update:value="emit('update:target', sg.id, $event)" />
    </td>

    <!-- Need -->
    <td
      class="px-3 py-2 text-center font-jetbrains tabular-data text-base rounded-sm"
      :class="[needClass(derived.need), needBg(derived.need)]"
    >
      <span v-if="derived.need > 0">{{ derived.need }}</span>
      <span v-else class="text-zinc-600">0</span>
    </td>

    <!-- Players — managed per sub-row -->
    <td class="px-3 py-2">
      <span class="text-zinc-700 text-xs font-jetbrains">—</span>
    </td>

    <!-- Commits — managed per sub-row -->
    <td class="px-3 py-2">
      <span class="text-zinc-700 text-xs font-jetbrains">—</span>
    </td>
  </tr>
</template>
