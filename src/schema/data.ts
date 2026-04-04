export type Tournament = {
  id: number;
  year: number;
  location: string;
  country: string;
  start?: string;
  end?: string;
  website?: string;
  referee?: string;
  games: Record<string, Game>;
  stages: Stage[];
  top: string[];
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
  SODOS = 'sodos',
  SOSOS = 'sosos',
  STARTING_POSITION = 'starting',
  DIRECT_MATCH = 'direct',
  RANK = 'rank',
  SCORE = 'score',
}

export type ScoringBreaker =
  | Breaker.WINS
  | Breaker.SCORE
  | Breaker.SOS
  | Breaker.SODOS
  | Breaker.SOSOS
  | Breaker.STARTING_POSITION
  | Breaker.RANK;

// Then modify the BaseStage type to use the enum
export type BaseStage = {
  name?: Record<string, string>;
  date?: TournamentDateSpan[];
  egd?: string;
  time?: string;
  komi?: number;
  rules?: string;
};

export type LeagueStage = BaseStage & {
  type: 'league';
  rounds: string[][];
  table: TableResult[];
  breakers?: Breaker[];
  order?: string[];
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

export type TableResult = Record<ScoringBreaker, number> & {
  id: string;
  place: number;
  index: number;
  games: (IndexedTablePlayerGame | null)[];
  won: string[];
  lost: string[];
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

export type StatsPlayerGame = {
  opponent: string;
  won: boolean;
  result: string;
  game: string;
  index?: number;
};

export type StatsPlayerResult = {
  year: number;
  stage: Stage['type'];
  place: number;
  games: StatsPlayerGame[];
  won: number;
  rank: string;
};

export type StatsPlayer = {
  id: string;
  name?: string;
  medals: [string[], string[], string[]];
  years: number[];
  results: StatsPlayerResult[];
  score: number;
  totalGames: number;
  totalWon: number;
};

export type Stats = {
  tournaments: number;
  playedGames: number;
  games: Record<string, Game>;
  sgfs: number;
  resign: number;
  timeout: number;
  relays: number;
  streams: number;
  analysis: number;
  players: Record<string, StatsPlayer>;
  black: number;
  winners: StatsPlayer[];
};
