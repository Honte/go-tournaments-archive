import type { ApiGameInfo } from '@/schema/api';

export const GAME_RESULT_TYPES = ['resignation', 'points', 'time', 'other', 'unknown'] as const;
export const GAME_MEDIA = ['ogs', 'yt', 'ai'] as const;
export const GAME_WINNERS = [
  'black',
  'white',
  'jigo',
  'player',
  'player-opponent',
  'country',
  'country-opponent',
] as const;
export const PLAYER_COLORS = ['black', 'white'] as const;
export const GAME_SORTS = [
  'year-desc',
  'year-asc',
  'moves-desc',
  'moves-asc',
  'black-rank-desc',
  'black-rank-asc',
  'white-rank-desc',
  'white-rank-asc',
  'rank-gap-asc',
  'rank-gap-desc',
] as const;
export const GAME_GROUPS = [
  'none',
  'opponent-player',
  'opponent-country',
  'country-player',
  'year',
  'category',
] as const;
export const QUERY_KEYS = [
  'player',
  'country',
  'opponent',
  'opponentCountry',
  'category',
  'playerColor',
  'playerRankMin',
  'playerRankMax',
  'opponentRankMin',
  'opponentRankMax',
  'year',
  'yearMin',
  'yearMax',
  'movesMin',
  'movesMax',
  'result',
  'komi',
  'winner',
  'has',
  'sort',
  'group',
] as const;

export type GameResultType = (typeof GAME_RESULT_TYPES)[number];
export type GameMedia = (typeof GAME_MEDIA)[number];
export type GameWinner = (typeof GAME_WINNERS)[number];
export type PlayerColor = (typeof PLAYER_COLORS)[number];
export type GameSort = (typeof GAME_SORTS)[number];
export type GameGroup = (typeof GAME_GROUPS)[number];

export type GameRecordsState = {
  player?: string;
  country?: string;
  opponent?: string;
  opponentCountry?: string;
  category?: string;
  playerColor?: PlayerColor;
  playerRankMin?: string;
  playerRankMax?: string;
  opponentRankMin?: string;
  opponentRankMax?: string;
  years: number[];
  movesMin?: number;
  movesMax?: number;
  results: GameResultType[];
  komi: string[];
  winner?: GameWinner;
  media: GameMedia[];
  sort: GameSort;
  group: GameGroup;
};

export const DEFAULT_GAME_RECORDS_STATE: GameRecordsState = {
  years: [],
  results: [],
  komi: [],
  media: [],
  sort: 'year-desc',
  group: 'none',
};

export type GameFacetOption = { value: string; label: string; count: number; search?: string };
export type GameFacet = { visible: boolean; options: GameFacetOption[] };
export type GameRecordsGroupResult = { key: string; label?: string; games: ApiGameInfo[] };
export type GameRecordsDomains = { ranks: string[]; years: number[]; movesMin?: number; movesMax?: number };

export type GameRecordsModel = {
  state: GameRecordsState;
  totalCount: number;
  filteredCount: number;
  hasJigo: boolean;
  games: ApiGameInfo[];
  groups: GameRecordsGroupResult[];
  facets: {
    player: GameFacet;
    country: GameFacet;
    opponent: GameFacet;
    opponentCountry: GameFacet;
    category: GameFacet;
    playerColor: Record<PlayerColor, number>;
    year: GameFacet;
    result: Record<GameResultType, number>;
    komi: GameFacet;
    winner: Record<GameWinner, number>;
    media: Record<GameMedia, number>;
  };
  domains: GameRecordsDomains;
  grouping: { opponentPlayer: boolean; opponentCountry: boolean; countryPlayer: boolean; category: boolean };
};

export type GameRecordsOptions = {
  countriesEnabled?: boolean;
  categoriesEnabled?: boolean;
  countryLabel?: (country: string) => string;
  categoryLabel?: (category: string) => string;
  unknownKomiLabel?: string;
  unknownCountryLabel?: string;
};

export type SearchParamsReader = Pick<URLSearchParams, 'get' | 'getAll'>;
