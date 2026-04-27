import { type GameViewerPayload, SHOW_GAME_VIEWER_EVENT } from '@/components/viewer/schema';

export function dispatchGameEvent(detail: GameViewerPayload) {
  document.dispatchEvent(
    new CustomEvent<GameViewerPayload>(SHOW_GAME_VIEWER_EVENT, {
      detail,
    })
  );
}
