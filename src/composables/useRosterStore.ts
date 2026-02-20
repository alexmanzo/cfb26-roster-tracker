import { computed } from 'vue';
import type { Commit, DerivedStats, PositionGroup, RosterState } from '../types/roster';
import { DEFAULT_POSITIONS } from '../data/defaultPositions';
import { useLocalStorage } from './useLocalStorage';

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Singleton — created once at module level so all components share state
let _store: ReturnType<typeof createStore> | null = null;

function createStore() {
  const state = useLocalStorage<RosterState>('cfb26-roster', {
    version: 1,
    positions: deepClone(DEFAULT_POSITIONS),
  });

  const derivedMap = computed(() => {
    const map = new Map<string, DerivedStats>();
    for (const pos of state.value.positions) {
      const total = pos.players.length;
      const projected = (total - pos.srTr) + pos.commits.length;
      const need = pos.target - projected;
      map.set(pos.id, { total, projected, need });
    }
    return map;
  });

  function getPosition(id: string): PositionGroup | undefined {
    return state.value.positions.find(p => p.id === id);
  }

  function updateSrTr(posId: string, value: number) {
    const pos = getPosition(posId);
    if (pos) pos.srTr = Math.max(0, value);
  }

  function updateTarget(posId: string, value: number) {
    const pos = getPosition(posId);
    if (pos) pos.target = Math.max(0, value);
  }

  function addPlayer(posId: string, ovr: number) {
    const pos = getPosition(posId);
    if (pos) {
      pos.players.push({ id: makeId(), ovr });
    }
  }

  function removePlayer(posId: string, playerId: string) {
    const pos = getPosition(posId);
    if (pos) {
      pos.players = pos.players.filter(p => p.id !== playerId);
    }
  }

  function updatePlayerOvr(posId: string, playerId: string, ovr: number) {
    const pos = getPosition(posId);
    if (pos) {
      const player = pos.players.find(p => p.id === playerId);
      if (player) player.ovr = ovr;
    }
  }

  function addCommit(posId: string, stars: Commit['stars'], isAth: boolean) {
    const pos = getPosition(posId);
    if (pos) {
      pos.commits.push({ id: makeId(), stars, isAth });
    }
  }

  function removeCommit(posId: string, commitId: string) {
    const pos = getPosition(posId);
    if (pos) {
      pos.commits = pos.commits.filter(c => c.id !== commitId);
    }
  }

  function removeLastCommit(posId: string) {
    const pos = getPosition(posId);
    if (pos && pos.commits.length > 0) {
      pos.commits.pop();
    }
  }

  function resetSrTr() {
    for (const pos of state.value.positions) {
      pos.srTr = 0;
    }
  }

  function resetToDefaults() {
    state.value = {
      version: 1,
      positions: deepClone(DEFAULT_POSITIONS),
    };
  }

  return {
    state,
    derivedMap,
    updateSrTr,
    updateTarget,
    addPlayer,
    removePlayer,
    updatePlayerOvr,
    addCommit,
    removeCommit,
    removeLastCommit,
    resetSrTr,
    resetToDefaults,
  };
}

export function useRosterStore() {
  if (!_store) {
    _store = createStore();
  }
  return _store;
}
