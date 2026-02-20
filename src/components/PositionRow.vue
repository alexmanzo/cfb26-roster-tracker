<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { DerivedStats, PositionGroup } from '../types/roster';
import CommitBadgeList from './CommitBadgeList.vue';
import EditableCell from './EditableCell.vue';
import PlayerPill from './PlayerPill.vue';

const props = defineProps<{
  pos: PositionGroup;
  derived: DerivedStats;
  isFocused: boolean;
  athPending: boolean;
}>();

const emit = defineEmits<{
  'row-focus': [id: string];
  'update:srTr': [posId: string, value: number];
  'update:target': [posId: string, value: number];
  'add-player': [posId: string, ovr: number];
  'remove-player': [posId: string, playerId: string];
  'update-player-ovr': [posId: string, playerId: string, ovr: number];
}>();

const showAddPlayer = ref(false);
const newOvr = ref(80);

function onAddPlayer() {
  if (newOvr.value >= 1 && newOvr.value <= 99) {
    emit('add-player', props.pos.id, newOvr.value);
    newOvr.value = 80;
    showAddPlayer.value = false;
  }
}

// When a pill is removed via keyboard, keep focus on the nearest remaining pill.
function handleRemovePlayer(playerId: string) {
  const pills = Array.from(
    document.querySelectorAll(`[data-pos-id="${props.pos.id}"] [data-player-pill]`),
  ) as HTMLElement[];
  const focusedIdx = pills.findIndex((el) => el === document.activeElement);

  emit('remove-player', props.pos.id, playerId);

  if (focusedIdx >= 0) {
    nextTick(() => {
      const newPills = Array.from(
        document.querySelectorAll(`[data-pos-id="${props.pos.id}"] [data-player-pill]`),
      ) as HTMLElement[];
      const targetIdx = Math.min(focusedIdx, newPills.length - 1);
      if (targetIdx >= 0) newPills[targetIdx]?.focus();
    });
  }
}

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
  <tr
    :data-pos-id="pos.id"
    class="border-b border-zinc-800/70 transition-colors cursor-pointer group/row"
    :class="isFocused ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'"
    @click="emit('row-focus', pos.id)"
    tabindex="0"
    @focus="emit('row-focus', pos.id)"
    @keydown.enter.prevent="emit('row-focus', pos.id)"
  >
    <!-- Position label -->
    <td
      class="px-3 py-2.5 whitespace-nowrap transition-colors"
      :class="isFocused ? 'border-l-2 border-blue-500' : 'border-l-2 border-transparent'"
    >
      <div class="flex items-center gap-2">
        <span
          class="font-barlow font-bold text-[19px] tracking-wide leading-none"
          :class="isFocused ? 'text-zinc-100' : 'text-zinc-300'"
          >{{ pos.label }}</span
        >
        <span v-if="isFocused" class="inline-block w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
      </div>
    </td>

    <!-- Total -->
    <td class="px-3 py-2.5 text-center font-jetbrains tabular-data text-base text-zinc-400">
      {{ derived.total }}
    </td>

    <!-- SR/TR -->
    <td class="px-2 py-1.5 text-center" @click.stop>
      <EditableCell :value="pos.srTr" @update:value="emit('update:srTr', pos.id, $event)" />
    </td>

    <!-- Projected -->
    <td
      class="px-3 py-2.5 text-center font-jetbrains tabular-data text-base"
      :class="derived.projected < pos.target ? 'text-orange-300/70' : 'text-zinc-400'"
    >
      {{ derived.projected }}
    </td>

    <!-- Target -->
    <td class="px-2 py-1.5 text-center" @click.stop>
      <EditableCell :value="pos.target" @update:value="emit('update:target', pos.id, $event)" />
    </td>

    <!-- Need -->
    <td
      class="px-3 py-2.5 text-center font-jetbrains tabular-data text-base rounded-sm"
      :class="[needClass(derived.need), needBg(derived.need)]"
    >
      <span v-if="derived.need > 0">{{ derived.need }}</span>
      <span v-else="derived.need === 0" class="text-zinc-600">0</span>
    </td>

    <!-- Players -->
    <td class="px-3 py-2.5" @click.stop>
      <div class="flex flex-wrap gap-1.5 items-center min-h-[28px]">
        <PlayerPill
          v-for="player in pos.players"
          :key="player.id"
          :player="player"
          :posId="pos.id"
          @remove="handleRemovePlayer"
          @update="(playerId, ovr) => emit('update-player-ovr', pos.id, playerId, ovr)"
        />

        <!-- Add player inline form -->
        <input
          v-if="showAddPlayer"
          type="number"
          v-model="newOvr"
          class="w-14 px-1.5 py-[6px] font-jetbrains text-base font-bold rounded border border-blue-400/70 bg-zinc-800 text-blue-300 text-center outline-none"
          min="1"
          max="99"
          @keydown.enter.prevent="onAddPlayer"
          @keydown.escape="showAddPlayer = false"
          @blur="showAddPlayer = false"
          v-focus
        />
        <button
          v-else
          class="inline-flex items-center justify-center w-5 h-5 rounded border border-dashed border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400 text-xs transition-colors opacity-0 group-hover/row:opacity-100"
          @click.stop="showAddPlayer = true"
          title="Add player"
          tabindex="-1"
        >
          +
        </button>
      </div>
    </td>

    <!-- Commits -->
    <td class="px-3 py-2.5 min-w-[200px]">
      <CommitBadgeList :commits="pos.commits" :athPending="isFocused && athPending" />
    </td>
  </tr>
</template>
