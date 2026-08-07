'use client';

import dynamic from 'next/dynamic';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { canNavigateBackTo, navigateBack, updateNavigationUrl } from '@/libs/navigation';
import { getGameViewerSearch } from '@/components/viewer/utils';
import { useNavigationSearchParams } from '@/hooks/useNavigation';

const GameViewerDialog = dynamic(
  () => import('@/components/viewer/GameViewerModal').then((mod) => mod.GameViewerModal),
  {
    ssr: false,
  }
);

type GameViewerProps = {
  event: EventContext;
  translations: Translations;
};

export function GameViewer({ event, translations }: GameViewerProps) {
  const search = useNavigationSearchParams();
  const sgfPath = search.get('sgf');

  if (!sgfPath) {
    return null;
  }

  const close = () => {
    const closedSearch = getGameViewerSearch(search, null);

    if (canNavigateBackTo(closedSearch)) {
      navigateBack();
    } else {
      updateNavigationUrl(closedSearch, 'push');
    }
  };

  return <GameViewerDialog event={event} sgfPath={sgfPath} translations={translations} onClose={close} />;
}
