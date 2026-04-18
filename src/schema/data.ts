import type { Locale } from '@/i18n/consts';

export type TournamentDetails = {
  year: number;
  name?: string | Record<Locale, string>;
  description?: string | Record<Locale, string>;
  location: string;
  country?: string;
  start?: string;
  end?: string;
  website?: string;
  referee?: string;
  top: string[];
  categoriesTop?: Record<string, string[]>;
  displayReversed?: boolean;
};

export type Tournament = TournamentDetails & {
  id: number;
  games: Record<string, Game>;
  stages: Stage[];
  players: Record<string, Player>;
};

export type TournamentDateSpan = {
  start: string;
  end: string;
};

export type Stage = LeagueStage | LadderTableStage | FinalStage | RoundRobinTableStage;

export enum Breaker {
  WINS = 'wins',
  SOS = 'sos',
  MMS = 'mms',
  SODOS = 'sodos',
  SOSOS = 'sosos',
  STARTING_POSITION = 'starting',
  DIRECT_MATCH = 'direct',
  RANK = 'rank',
  SCORE = 'score',
}

export type CustomBreaker = {
  order?: 'asc' | 'desc'; // by default descending
  hidden?: boolean; // by default visible
  translations?: Record<Locale, string>;
  description?: Record<Locale, string>;
};

export type MandatoryBreakers =
  | Breaker.WINS
  | Breaker.SOS
  | Breaker.SODOS
  | Breaker.SOSOS
  | Breaker.STARTING_POSITION
  | Breaker.RANK;

// Then modify the BaseStage type to use the enum
export type BaseStage = {
  name?: string | Record<Locale, string>;
  notes?: string | Record<Locale, string>;
  date?: TournamentDateSpan[];
  egd?: string;
  time?: string;
  komi?: number;
  rules?: string;
  promoted?: number;
  placeOffset?: number;
};

export type LeagueStage = BaseStage & {
  type: 'league' | 'tournament';
  rounds: string[][];
  table: TableResult[];
  breakers?: Breaker[];
  customBreakers?: Record<string, CustomBreaker>;
  order?: string[];
  games?: string[];
};

export type LadderTableStage = BaseStage & {
  type: 'ladder-table';
  rounds: string[][];
  order: string[];
  table: {
    id: string;
    place: number;
    index: number;
    games: (IndexedTablePlayerGame | null)[];
    playoffs: IndexedTablePlayerGame[];
  }[];
  playoffs: string[];
};

export type FinalStage = BaseStage & {
  type: 'final';
  games: string[];
  table: {
    id: string;
    place: number;
    games: TablePlayerGame[];
    wins: number;
    prevScore?: number;
  }[];
  includePrevious?: boolean;
  requiredWins?: number;
};

export type RoundRobinTableStage = BaseStage & {
  type: 'round-robin-table';
  games: string[];
  table: {
    id: string;
    place: number;
    score: number;
    games: TablePlayerGame[];
    rank: number;
  }[];
};

export type TableResult = {
  id: string;
  place: number;
  index: number;
  games: (IndexedTablePlayerGame | null)[];
  won: string[];
  lost: string[];
  breakers: Record<MandatoryBreakers, number> & Record<string, number>;
};

export type TablePlayerGame = {
  opponent: string;
  won: boolean;
  result: string;
  game: string;
};

export type IndexedTablePlayerGame = TablePlayerGame & {
  index: number;
};

export type Player = {
  id: string;
  name: string;
  rank: string;
  country?: string;
  egd?: number;
};

export type Game = {
  id: string;
  players: [black: GamePlayer, white: GamePlayer];
  result: string;
  props: GameProps;
};

export type GamePlayer = {
  id: string;
  won: boolean;
  score?: string;
  color?: 'white' | 'black';
};

export type GameProps = {
  ai?: string;
  yt?: string | string[];
  ogs?: string;
  sgf?: string;
  svg?: string;
  png?: string;
};

export type GamePropsKey = keyof GameProps;
export type GamePropsArrayKey = {
  [K in GamePropsKey]-?: Extract<GameProps[K], any[]> extends never ? never : K;
}[GamePropsKey];

export type StatsMedals = [gold: string[], silver: string[], bronze: string[]];

export type StatsPlayerGame = {
  opponent: string;
  opponentCountry?: string;
  won: boolean;
  result: string;
  game: string;
  index?: number;
};

export type StatsPlayerResult = {
  year: number;
  stage: Stage['type'];
  place: number;
  finalPlace: number;
  games: StatsPlayerGame[];
  won: number;
  rank: string;
  country?: string;
};

export type StatsPlayer = {
  id: string;
  name: string;
  countries: Set<string>;
  medals: StatsMedals;
  years: number[];
  results: StatsPlayerResult[];
  score: number;
  bestPlace: number;
  totalGames: number;
  totalWon: number;
};

export type StatsOpponent = {
  id: string;
  name: string;
  countries: Set<string>;
  games: {
    year: number;
    won: boolean;
  }[];
};

export type StatsCountryResult = {
  year: number;
  bestPlace: number;
  totalWon: number;
  totalGames: number;
  results: (StatsPlayerResult & { id: string; name: string })[];
};

export type StatsCountry = {
  country: string;
  medals: StatsMedals;
  score: number;
  years: Record<number, StatsCountryResult>;
  bestPlace: number;
  totalGames: number;
  totalWon: number;
};

export type Stats = {
  summary: StatsSummary;
  games: Record<string, Game>;
  players: Record<string, StatsPlayer>;
  countries: Record<string, StatsCountry>;
};

export type StatsSummary = {
  tournaments: number;
  playedGames: number;
  sgfs: number;
  resign: number;
  timeout: number;
  relays: number;
  streams: number;
  analysis: number;
  players: number;
  black: number;
};

export type TableStats = {
  bestPlace: number;
  attended: number;
  gold: number;
  silver: number;
  bronze: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
};
