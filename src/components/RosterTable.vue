<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import type { DerivedStats } from '../types/roster';
import { useRosterStore } from '../composables/useRosterStore';
import { useKeyboardNav } from '../composables/useKeyboardNav';
import PositionRow from './PositionRow.vue';

const {
  state,
  derivedMap,
  updateSrTr,
  updateTarget,
  addPlayer,
  removePlayer,
  updatePlayerOvr,
  addCommit,
  removeLastCommit,
} = useRosterStore();

const positionIds = computed(() => state.value.positions.map(p => p.id));

const { focusedRowId, athPending, handleKeydown, setFocus } = useKeyboardNav(
  positionIds,
  addCommit,
  removeLastCommit
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// Position group definitions — drives section separator rows
const GROUP_DEFS = [
  {
    label: 'OFFENSE',
    firstId: 'qb',
    textClass: 'text-blue-400',
    lineClass: 'bg-blue-500/25',
    bgClass: 'bg-blue-500/[0.03]',
  },
  {
    label: 'DEFENSE',
    firstId: 'ledg',
    textClass: 'text-red-400',
    lineClass: 'bg-red-500/25',
    bgClass: 'bg-red-500/[0.03]',
  },
  {
    label: 'SPECIAL TEAMS',
    firstId: 'k',
    textClass: 'text-emerald-400',
    lineClass: 'bg-emerald-500/25',
    bgClass: 'bg-emerald-500/[0.03]',
  },
] as const;

type GroupDef = typeof GROUP_DEFS[number];
const groupStartMap = new Map<string, GroupDef>(GROUP_DEFS.map(g => [g.firstId, g]));

function getGroupForStart(id: string): GroupDef | null {
  return groupStartMap.get(id) ?? null;
}

defineExpose({ state, derivedMap });
</script>

<template>
  <div>
    <table class="w-full border-collapse text-sm">
      <!-- thead sticks at h-14 (56px) to sit below the sticky AppHeader -->
      <thead class="sticky top-14 z-10 bg-zinc-900/98">
        <tr class="border-b-2 border-zinc-700/80">
          <th class="px-3 py-2.5 text-left font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-16">Pos</th>
          <th class="px-3 py-2.5 text-center font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-14">Total</th>
          <th class="px-3 py-2.5 text-center font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-16">SR/TR</th>
          <th class="px-3 py-2.5 text-center font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-20">Proj</th>
          <th class="px-3 py-2.5 text-center font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-16">Target</th>
          <th class="px-3 py-2.5 text-center font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] w-14">Need</th>
          <th class="px-3 py-2.5 text-left font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em]">Players</th>
          <th class="px-3 py-2.5 text-left font-barlow text-sm font-semibold text-zinc-500 uppercase tracking-[0.12em] min-w-[220px]">Commits</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="pos in state.positions" :key="pos.id">

          <!-- Position group section divider -->
          <tr v-if="getGroupForStart(pos.id)" :class="getGroupForStart(pos.id)!.bgClass">
            <td colspan="8" class="px-3 py-[5px]">
              <div class="flex items-center gap-3">
                <div class="h-px w-2 shrink-0" :class="getGroupForStart(pos.id)!.lineClass" />
                <span
                  class="font-barlow text-sm font-bold tracking-[0.3em] uppercase shrink-0"
                  :class="getGroupForStart(pos.id)!.textClass"
                >{{ getGroupForStart(pos.id)!.label }}</span>
                <div class="h-px flex-1" :class="getGroupForStart(pos.id)!.lineClass" />
              </div>
            </td>
          </tr>

          <PositionRow
            :pos="pos"
            :derived="(derivedMap.get(pos.id) as DerivedStats)"
            :isFocused="focusedRowId === pos.id"
            :athPending="athPending"
            @row-focus="setFocus"
            @update:srTr="updateSrTr"
            @update:target="updateTarget"
            @add-player="addPlayer"
            @remove-player="removePlayer"
            @update-player-ovr="updatePlayerOvr"
          />

        </template>
      </tbody>
    </table>
  </div>
</template>
