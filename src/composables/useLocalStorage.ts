import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key);
  const initial = stored ? (JSON.parse(stored) as T) : defaultValue;

  const state = ref<T>(initial) as Ref<T>;

  watch(
    state,
    (val) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    { deep: true }
  );

  return state;
}
