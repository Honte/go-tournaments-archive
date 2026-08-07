export function getGameViewerSearch(search: URLSearchParams, sgfPath: string | null) {
  const next = new URLSearchParams(search);

  if (sgfPath) {
    next.set('sgf', sgfPath);
  } else {
    next.delete('sgf');
  }

  return next;
}
