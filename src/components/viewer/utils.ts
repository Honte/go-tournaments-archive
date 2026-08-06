import { getNavigationSearch, updateNavigationUrl } from '@/libs/navigation';

export function getGameViewerSearch(search: URLSearchParams, sgfPath: string | null) {
  const next = new URLSearchParams(search);

  if (sgfPath) {
    next.set('sgf', sgfPath);
  } else {
    next.delete('sgf');
  }

  return next;
}

export function openGameViewer(sgfPath: string) {
  updateNavigationUrl(getGameViewerSearch(getNavigationSearch(), sgfPath), 'push');
}
