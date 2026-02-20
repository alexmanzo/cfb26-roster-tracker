<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import type { DerivedStats, PositionGroup, PositionSuperGroup, SuperGroupDerivedStats } from '../types/roster';
import { useRosterStore } from '../composables/useRosterStore';
import { useKeyboardNav } from '../composables/useKeyboardNav';
import PositionRow from './PositionRow.vue';
import PositionSuperGroupRow from './PositionSuperGroupRow.vue';

const {
  state,
  derivedMap,
  superGroupDerivedMap,
  updateSrTr,
  updateTarget,
  updateSuperGroupTarget,
  addPlayer,
  removePlayer,
  updatePlayerOvr,
  addCommit,
  removeCommit,
  removeLastCommit,
} = useRosterStore();

const positionIds = computed(() => state.value.positions.map(p => p.id));

type RenderItem =
  | { kind: 'section'; key: string; def: GroupDef }
  | { kind: 'superGroup'; key: string; sg: PositionSuperGroup; memberLabels: string[] }
  | { kind: 'position'; key: string; pos: PositionGroup; isSubRow: boolean };

const renderItems = computed((): RenderItem[] => {
  const items: RenderItem[] = [];
  const rendered = new Set<string>();
  const posOrder = new Map(state.value.positions.map((p, i) => [p.id, i]));

  // Build map: firstMemberId -> superGroup
  const sgFirstMap = new Map<string, PositionSuperGroup>();
  for (const sg of state.value.superGroups) {
    const firstId = [...sg.memberIds].sort(
      (a, b) => (posOrder.get(a) ?? 999) - (posOrder.get(b) ?? 999)
    )[0];
    if (firstId !== undefined) sgFirstMap.set(firstId, sg);
  }

  for (const pos of state.value.positions) {
    if (rendered.has(pos.id)) continue;

    // Section divider (OFFENSE / DEFENSE / SPECIAL TEAMS)
    const groupDef = getGroupForStart(pos.id);
    if (groupDef) items.push({ kind: 'section', key: `section-${groupDef.label}`, def: groupDef });

    const sg = sgFirstMap.get(pos.id);
    if (sg) {
      // Emit super group header then all members together
      const memberLabels = sg.memberIds.map(
        id => state.value.positions.find(p => p.id === id)?.label ?? id.toUpperCase()
      );
      items.push({ kind: 'superGroup', key: `sg-${sg.id}`, sg, memberLabels });

      const members = [...sg.memberIds].sort(
        (a, b) => (posOrder.get(a) ?? 999) - (posOrder.get(b) ?? 999)
      );
      for (const memberId of members) {
        const memberPos = state.value.positions.find(p => p.id === memberId);
        if (memberPos) {
          items.push({ kind: 'position', key: `pos-${memberPos.id}`, pos: memberPos, isSubRow: true });
          rendered.add(memberId);
        }
      }
    } else {
      items.push({ kind: 'position', key: `pos-${pos.id}`, pos, isSubRow: false });
      rendered.add(pos.id);
    }
  }

  return items;
});

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
        <template v-for="item in renderItems" :key="item.key">

          <!-- Offense / Defense / Special Teams section divider -->
          <tr v-if="item.kind === 'section'" :class="item.def.bgClass">
            <td colspan="8" class="px-3 py-[5px]">
              <div class="flex items-center gap-3">
                <div class="h-px w-2 shrink-0" :class="item.def.lineClass" />
                <span
                  class="font-barlow text-sm font-bold tracking-[0.3em] uppercase shrink-0"
                  :class="item.def.textClass"
                >{{ item.def.label }}</span>
                <div class="h-px flex-1" :class="item.def.lineClass" />
              </div>
            </td>
          </tr>

          <!-- Position super-group summary row -->
          <PositionSuperGroupRow
            v-else-if="item.kind === 'superGroup'"
            :sg="item.sg"
            :derived="(superGroupDerivedMap.get(item.sg.id) as SuperGroupDerivedStats)"
            :memberLabels="item.memberLabels"
            @update:target="updateSuperGroupTarget"
          />

          <!-- Individual position row -->
          <PositionRow
            v-else
            :pos="item.pos"
            :derived="(derivedMap.get(item.pos.id) as DerivedStats)"
            :isFocused="focusedRowId === item.pos.id"
            :athPending="athPending"
            :isSubRow="item.isSubRow"
            @row-focus="setFocus"
            @update:srTr="updateSrTr"
            @update:target="updateTarget"
            @add-player="addPlayer"
            @remove-player="removePlayer"
            @update-player-ovr="updatePlayerOvr"
            @remove-commit="removeCommit"
          />

        </template>
      </tbody>
    </table>
  </div>
</template>
