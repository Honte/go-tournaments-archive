import type { GameProps } from '@/schema/data';

export const SHOW_GAME_VIEWER_EVENT = 'show-game-viewer';

export type GameViewerPlayer = {
  id: string;
  name: string;
  rank: string;
  country?: string;
};

export type GameViewerPayload = {
  black: GameViewerPlayer;
  white: GameViewerPlayer;
  props: GameProps;
  result?: string;
  komi?: number;
  title: string;
};
