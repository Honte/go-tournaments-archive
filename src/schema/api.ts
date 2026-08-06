import type { GameProps, Player, Stage } from '@/schema/data';
import type { LocalizedString } from '@/i18n/consts';

export type ApiGameInfo = Omit<GameProps, 'sgf'> & {
  sgf: string;
  tournament: number;
  stage: number;
  moves: number;
  komi?: number | null;
  stageName?: LocalizedString;
  stageType?: Stage['type'];
  category?: string;
  black: Player;
  white: Player;
  winner?: 'black' | 'white';
  result?: string;
};
