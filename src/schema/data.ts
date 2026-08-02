import type { Locale, LocalizedString } from '@/i18n/consts';
import type { SgfRotation } from '@tools/sgf';
import type { KeysMatching } from '@/libs/types';

export type TournamentDetails = {
  year: number;
  name?: LocalizedString;
  notes?: LocalizedString;
  location?: string;
  country?: string;
  start?: string;
  end?: string;
  website?: string | string[];
  referee?: string;
  top: string[][];
  categories?: string[];
  categoriesTop?: Record<string, string[][]>;
  displayReversed?: boolean;
  announcement?: boolean | LocalizedString;
};

export type Tournament = TournamentDetails & {
  id: number;
  games: Record<string, Game>;
  stages: Stage[];
  players: Record<string, Player>;
  hasSgfs: boolean;
};

export type TournamentWithDescription = Tournament & {
  description?: LocalizedString;
};

export type TournamentDateSpan = {
  start: string;
  end: string;
};

export type TournamentItem = {
  year: number;
  location?: string;
  country?: string;
  hasSgfs?: boolean;
};

export type Stage = LeagueStage | LadderTableStage | FinalStage | RoundRobinTableStage | ClassificationStage;

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
  name?: LocalizedString;
  notes?: LocalizedString;
  location?: string;
  country?: string;
  date?: TournamentDateSpan[];
  egd?: string;
  time?: string;
  komi?: number;
  rules?: string;
  promoted?: number;
  placeOffset?: number;
  excluded?: boolean;
  collapsed?: boolean;
};

export type LeagueStage = BaseStage & {
  type: 'league' | 'tournament';
  rounds: string[][];
  table: TableResult[];
  breakers?: Breaker[];
  columns?: string[];
  customBreakers?: Record<string, CustomBreaker>;
  order?: string[];
  games?: string[];
};

export type ClassificationStage = BaseStage & {
  type: 'classification';
  order: (string | string[])[];
  table: {
    id: string;
    place: number;
    index: number;
  }[];
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
  drawn: string[];
  lost: string[];
  breakers: Record<MandatoryBreakers, number> & Record<string, number>;
  categories?: Record<string, number | '?'>;
};

export type TablePlayerGame = {
  color?: 'white' | 'black';
  opponent: string;
  won: boolean;
  drawn: boolean;
  result: string;
  game: string;
};

export type IndexedTablePlayerGame = TablePlayerGame & {
  index: number;
};

export type Player = {
  id: string;
  name: string;
  rank?: string;
  country?: string;
  egd?: number;
  original?: string;
  nickname?: string[];
  hasStats?: boolean;
};

export type Game = {
  id: string;
  stage: number;
  players: [black: GamePlayer, white: GamePlayer];
  draw: boolean;
  result: string;
  props: GameProps;
  path?: string;
  rotation?: SgfRotation;
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
  jpg?: string;
  png?: string;
  round?: number;
  index?: number;
};

export type GamePropsArrayKey = KeysMatching<GameProps, string[]>;
export type StatsMedals = [gold: string[], silver: string[], bronze: string[]];

export type PlayerGame = {
  id: string; // opponent id
  country?: string; // opponent country
  rank?: string; // opponent rank
  color?: 'white' | 'black'; // player color
  won: boolean;
  drawn: boolean;
  result: string;
  props?: GameProps;
};

export type PlayerSummary = {
  id: string;
  egd?: number;
  name: string;
  original?: string;
  nickname?: string[];
  medals: StatsMedals;
  categoriesMedals: Record<string, StatsMedals>;
  country: string[];
  bestPlace: number;
  totalGames: number;
  totalWon: number;
  totalDrawn: number;
  totalAttended: number;
  totalSgfs: number;
  score: number;
};

export type PlayerStats = PlayerSummary & {
  results: PlayerResult[];
  opponents: Record<string, string>;
};

export type PlayerResult = {
  year: number;
  place: number;
  name: string;
  rank?: string;
  country?: string;
  stages: PlayerStageResult[];
};

export type PlayerStageResult = Pick<Stage, 'name' | 'type'> & {
  place: number;
  games: PlayerGame[];
  categories?: Record<string, number | '?'>;
};

export type CountryResult = {
  year: number;
  bestPlace: number;
  totalWon: number;
  totalDrawn: number;
  totalGames: number;
  results: (PlayerResult & { id: string })[];
};

export type CountrySummary = {
  code: string;
  medals: StatsMedals;
  categoriesMedals: Record<string, StatsMedals>;
  score: number;
  bestPlace: number;
  totalGames: number;
  totalWon: number;
  totalDrawn: number;
};

export type CountryStats = CountrySummary & {
  years: Record<number, CountryResult>;
};

export type CategoryPlayer = {
  id: string;
  name: string;
  rank: string;
  country?: string;
  place: number | '?';
};

export type CategoryStats = {
  category: string;
  tournaments: {
    year: number;
    results: CategoryPlayer[];
  }[];
};

export type Stats = {
  summary: StatsSummary;
  games: Record<string, Game>;
  players: Record<string, PlayerStats>;
  countries: Record<string, CountryStats>;
  categories: Record<string, CategoryStats>;
};

export type StatsSummary = {
  tournaments: number;
  playedGames: number;
  sgfs: number;
  resign: number;
  timeout: number;
  draws: number;
  relays: number;
  streams: number;
  analysis: number;
  players: number;
  black: number;
};

export type EventSummary = {
  attendants: PlayerSummary[];
  medalists: PlayerSummary[];
  countryMedals: CountrySummary[];
  totalStats: StatsSummary;
};

export type TableStats = {
  bestPlace: number;
  attended: number;
  gold: number;
  silver: number;
  bronze: number;
  games: number;
  won: number;
  drawn: number;
  lost: number;
  wonPercent: number;
};
