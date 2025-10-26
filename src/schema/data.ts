export type Tournament = {
  id: number;
  year: number;
  location: string;
  date: TournamentDateSpan[];
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
}

// Then modify the BaseStage type to use the enum
export type BaseStage = {
  name?: Record<string, string>;
  date: TournamentDateSpan[];
  egd?: string;
  time?: string;
  komi?: string;
  rules?: string;
};

export type LeagueStage = BaseStage & {
  type: 'league';
  rounds: string[][];
  table: TableResult[];
  breakers?: Breaker[];
};

export type LadderTableStage = BaseStage & {
  type: 'ladder-table';
  rounds: Game[][];
  table: {
    id: string;
    place: number;
    index: number;
    games: (IndexedTablePlayerGame | null)[];
    playoffs: (TablePlayerGame | null)[];
  }[];
  playoffs?: string[];
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
};

export type RoundRobinTableStage = BaseStage & {
  type: 'round-robin-table';
  games: string[];
  table: {
    id: string;
    score: number;
    games: TablePlayerGame[];
    rank: number;
  }[];
};

export type TableResult = {
  id: string;
  place: number;
  wins: number;
  sos: number;
  sodos: number;
  sosos: number;
  starting: number;
  games: (TablePlayerGame | null)[];
  won: string[];
  lost: string[];
  rank: number;
};

export type TablePlayerGame = {
  opponent: string;
  won: boolean;
  result: string;
  game: Game;
};

export type IndexedTablePlayerGame = TablePlayerGame & {
  index: number;
};

export type Player = {
  id: string;
  name: string;
  rank: string;
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
  yt?: string;
  ogs?: string;
  sgf?: string;
  svg?: string;
  png?: string;
};
