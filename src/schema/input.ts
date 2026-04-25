import { Breaker, type CustomBreaker } from '@/schema/data';

export type InputBaseStage = {
  name?: string | Record<string, string>;
  notes?: string | Record<string, string>;
  date: string | string[];
  egd?: string;
  time?: string;
  komi?: number;
  rules?: string;
  breakers?: Breaker[];
  promoted?: number;
  placeOffset?: number;
};

export type InputLeagueStage = InputBaseStage & {
  type: 'league';
  rounds: string[][];
  order?: string[];
};

export type InputLadderTableStage = InputBaseStage & {
  type: 'ladder-table';
  order: string[];
  rounds: string[][];
  playoffs?: string[];
};

export type InputFinalStage = InputBaseStage & {
  type: 'final';
  games: string[];
  requiredWins?: number;
  includePrevious?: boolean;
};

export type InputRoundRobinTableStage = InputBaseStage & {
  type: 'round-robin-table';
  games: string[];
};

export type InputTournamentStage = InputBaseStage & {
  type: 'tournament';
  file: string;
  dir?: string;
  scoringColumns?: (Breaker | string | null)[];
  findSharedPlaces?: boolean;
  sharedPlaces?: string[];
  games?: string[];
  unmatchedSgfs?: string[];
  customBreakers: Record<string, CustomBreaker>;
};

export type InputStage =
  | InputLeagueStage
  | InputLadderTableStage
  | InputFinalStage
  | InputRoundRobinTableStage
  | InputTournamentStage;

export type InputTournament = {
  location?: string;
  country?: string;
  referee?: string;
  website?: string | string[];
  players?: Record<string, string>;
  top?: string[];
  stages: InputStage[];
  displayReversed?: boolean;
  notes?: string | Record<string, string>;
};
