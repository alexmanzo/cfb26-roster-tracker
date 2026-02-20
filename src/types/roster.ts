export interface Player {
  id: string;
  ovr: number;
}

export interface Commit {
  id: string;
  stars: 1 | 2 | 3 | 4 | 5;
  isAth: boolean;
}

export interface PositionGroup {
  id: string;
  label: string;
  players: Player[];
  srTr: number;
  target: number;
  commits: Commit[];
}

export interface DerivedStats {
  total: number;
  projected: number;
  need: number;
}

export interface RosterState {
  version: number;
  positions: PositionGroup[];
}
