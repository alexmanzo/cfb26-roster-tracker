import { ref, nextTick } from 'vue';
import type { Ref } from 'vue';
import type { Commit } from '../types/roster';

export function useKeyboardNav(
  positionIds: Ref<string[]>,
  addCommit: (posId: string, stars: Commit['stars'], isAth: boolean) => void,
  removeLastCommit: (posId: string) => void
) {
  const focusedRowId = ref<string | null>(null);
  const athPending = ref(false);

  /** Returns the currently DOM-focused player pill element, or null. */
  function getActivePill(): HTMLElement | null {
    const el = document.activeElement as HTMLElement;
    // dataset.playerPill is defined (even as '') when data-player-pill attr is present
    return el?.dataset.playerPill !== undefined ? el : null;
  }

  /** Queries all pill spans for a given position row. */
  function getPills(posId: string): HTMLElement[] {
    return Array.from(
      document.querySelectorAll(`[data-pos-id="${posId}"] [data-player-pill]`)
    ) as HTMLElement[];
  }

  function blurActivePill() {
    getActivePill()?.blur();
  }

  function scrollRowIntoView(posId: string) {
    nextTick(() => {
      const row = document.querySelector(`[data-pos-id="${posId}"]`) as HTMLElement | null;
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const ids = positionIds.value;
    const currentIndex = focusedRowId.value ? ids.indexOf(focusedRowId.value) : -1;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5': {
        if (!focusedRowId.value) return;
        if (getActivePill()) return; // pill is focused — don't add commit
        const stars = parseInt(e.key) as Commit['stars'];
        addCommit(focusedRowId.value, stars, athPending.value);
        athPending.value = false;
        e.preventDefault();
        break;
      }

      case 'a':
      case 'A': {
        if (getActivePill()) return; // pill focused — ignore
        athPending.value = !athPending.value;
        e.preventDefault();
        break;
      }

      case 'ArrowRight': {
        if (!focusedRowId.value) return;
        const pills = getPills(focusedRowId.value);
        if (pills.length === 0) return;
        const active = getActivePill();
        if (!active) {
          pills[0]?.focus();
        } else {
          const idx = pills.indexOf(active);
          if (idx !== -1 && idx < pills.length - 1) pills[idx + 1]?.focus();
        }
        e.preventDefault();
        break;
      }

      case 'ArrowLeft': {
        const active = getActivePill();
        if (!active || !focusedRowId.value) return;
        const pills = getPills(focusedRowId.value);
        const idx = pills.indexOf(active);
        if (idx <= 0) {
          active.blur(); // exit pill mode
        } else {
          pills[idx - 1]?.focus();
        }
        e.preventDefault();
        break;
      }

      case 'Delete':
      case 'Backspace': {
        if (!focusedRowId.value) return;
        if (getActivePill()) return; // pill handles its own delete via .stop
        removeLastCommit(focusedRowId.value);
        athPending.value = false;
        e.preventDefault();
        break;
      }

      case 'ArrowUp': {
        blurActivePill();
        if (currentIndex > 0) {
          focusedRowId.value = ids[currentIndex - 1] ?? null;
        } else if (ids.length > 0) {
          focusedRowId.value = ids[ids.length - 1] ?? null;
        }
        if (focusedRowId.value) scrollRowIntoView(focusedRowId.value);
        e.preventDefault();
        break;
      }

      case 'ArrowDown': {
        blurActivePill();
        if (currentIndex < ids.length - 1) {
          focusedRowId.value = ids[currentIndex + 1] ?? null;
        } else if (ids.length > 0) {
          focusedRowId.value = ids[0] ?? null;
        }
        if (focusedRowId.value) scrollRowIntoView(focusedRowId.value);
        e.preventDefault();
        break;
      }

      case 'Escape': {
        const active = getActivePill();
        if (active) {
          active.blur(); // exit pill focus, stay on row
        } else {
          athPending.value = false;
        }
        e.preventDefault();
        break;
      }
    }
  }

  function setFocus(id: string) {
    blurActivePill();
    focusedRowId.value = id;
  }

  return {
    focusedRowId,
    athPending,
    handleKeydown,
    setFocus,
  };
}
