import type { GameProps, Player, Stage, StatsMedals, StatsPlayerGame } from '@/schema/data';

export type ApiPlayerStats = {
  id: string;
  egd?: number;
  name: string;
  medals: StatsMedals;
  categoriesMedals: Record<string, StatsMedals>;
  country?: string[];
  results: ApiPlayerResult[];
  bestPlace?: number;
  totalGames: number;
  totalWon: number;
  opponents: Record<string, string>;
};

export type ApiPlayerResult = {
  year: number;
  place: number;
  name: string;
  rank: string;
  country?: string;
  stages: ApiPlayerStage[];
};

export type ApiPlayerStage = Pick<Stage, 'name' | 'type'> & {
  place: number;
  games: StatsPlayerGame[];
};

export type ApiGameInfo = GameProps & {
  tournament: number;
  stage: number;
  moves: number;
  black: Player;
  white: Player;
  winner?: 'black' | 'white';
  result?: string;
};
