import type { GameProps, Player } from '@/schema/data';

export type ApiGameInfo = GameProps & {
  tournament: number;
  stage: number;
  moves: number;
  black: Player;
  white: Player;
  winner?: 'black' | 'white';
  result?: string;
};
