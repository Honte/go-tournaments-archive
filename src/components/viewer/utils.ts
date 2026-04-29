export const SHOW_GAME_VIEWER_EVENT = 'show-game-viewer';

export function dispatchGameEvent(sgfPath: string) {
  document.dispatchEvent(
    new CustomEvent(SHOW_GAME_VIEWER_EVENT, {
      detail: sgfPath,
    })
  );
}
