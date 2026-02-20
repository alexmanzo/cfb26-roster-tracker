<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  value: number;
  min?: number;
}>();

const emit = defineEmits<{
  'update:value': [value: number];
}>();

const localValue = ref(props.value);

watch(() => props.value, (v) => {
  localValue.value = v;
});

function onBlur() {
  const parsed = parseInt(String(localValue.value));
  const min = props.min ?? 0;
  if (!isNaN(parsed)) {
    emit('update:value', Math.max(min, parsed));
  } else {
    localValue.value = props.value;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    (e.target as HTMLInputElement).blur();
  }
  if (e.key === 'Escape') {
    localValue.value = props.value;
    (e.target as HTMLInputElement).blur();
  }
}
</script>

<template>
  <input
    type="number"
    v-model="localValue"
    class="w-13 px-1 py-1.5 text-center font-jetbrains text-base bg-transparent border border-transparent rounded hover:border-zinc-700 focus:border-blue-500/60 focus:bg-zinc-800/80 focus:text-zinc-100 focus:outline-none text-zinc-400 transition-all duration-100"
    :min="min ?? 0"
    @blur="onBlur"
    @keydown="onKeydown"
    @click.stop
  />
</template>
