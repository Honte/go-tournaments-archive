import type { Stage, StatsMedals, StatsPlayerGame } from '@/schema/data';

export type ApiPlayerStats = {
  id: string;
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
  rank: string;
  country?: string;
  stages: ApiPlayerStage[];
};

export type ApiPlayerStage = {
  type: Stage['type'];
  place: number;
  games: StatsPlayerGame[];
};
