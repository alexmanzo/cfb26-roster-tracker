<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Player } from '../types/roster';

const props = defineProps<{
  player: Player;
  posId: string;
}>();

const emit = defineEmits<{
  remove: [playerId: string];
  update: [playerId: string, ovr: number];
  'tab-next': [playerId: string];
  'tab-prev': [playerId: string];
}>();

const isEditing = ref(false);
const editValue = ref('');
const pillSpanRef = ref<HTMLElement | null>(null);
const suppressRefocus = ref(false);

function ovrColorClass(ovr: number): string {
  if (ovr >= 90) return 'text-purple-300 bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30';
  if (ovr >= 80) return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30';
  if (ovr >= 70) return 'text-amber-300 bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30';
  return 'text-red-300 bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
}

function startEdit() {
  editValue.value = String(props.player.ovr);
  isEditing.value = true;
}

function confirmEdit() {
  if (!isEditing.value) return; // guard against double-fire from blur after keydown
  const val = parseInt(editValue.value);
  if (!isNaN(val) && val >= 1 && val <= 99) {
    emit('update', props.player.id, val);
  }
  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); confirmEdit(); }
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  if (e.key === 'Tab') {
    e.preventDefault();
    suppressRefocus.value = true;
    confirmEdit();
    emit(e.shiftKey ? 'tab-prev' : 'tab-next', props.player.id);
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault();
  emit('remove', props.player.id);
}

// After editing ends (confirm or cancel), return focus to the pill span
// so the user can keep navigating with arrow keys or edit again.
watch(isEditing, (val) => {
  if (!val) {
    if (suppressRefocus.value) {
      suppressRefocus.value = false;
      return;
    }
    nextTick(() => pillSpanRef.value?.focus());
  }
});

defineExpose({ startEdit });
</script>

<template>
  <div class="relative group/pill inline-flex items-center">
    <!-- Edit mode: number input -->
    <input
      v-if="isEditing"
      type="number"
      v-model="editValue"
      class="w-10 h-[30px] px-2.5 font-jetbrains text-base font-bold rounded border border-blue-400/70 bg-zinc-800 text-blue-300 text-center outline-none leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      min="1"
      max="99"
      @blur="confirmEdit"
      @keydown="onEditKeydown"
      v-focus
    />

    <!-- Display mode: focusable pill span -->
    <template v-else>
      <span
        ref="pillSpanRef"
        tabindex="0"
        data-player-pill
        class="inline-flex items-center px-2.5 py-[6px] rounded border font-jetbrains text-base font-bold cursor-pointer leading-none transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950"
        :class="ovrColorClass(player.ovr)"
        @click="startEdit"
        @contextmenu="onContextMenu"
        @keydown.enter.stop.prevent="startEdit"
        @keydown.delete.stop.prevent="emit('remove', player.id)"
        @keydown.backspace.stop.prevent="emit('remove', player.id)"
        title="Enter to edit · Del to remove · ← → to navigate"
      >{{ player.ovr }}</span>

      <!-- Hover × button (mouse users) -->
      <button
        class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-zinc-700 text-zinc-300 text-[9px] leading-none items-center justify-center hidden group-hover/pill:flex hover:bg-red-500 hover:text-white transition-colors z-10"
        @click.stop="emit('remove', player.id)"
        tabindex="-1"
        title="Remove"
      >×</button>
    </template>
  </div>
</template>
