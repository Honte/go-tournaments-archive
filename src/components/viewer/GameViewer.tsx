'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type { Translations } from '@/i18n/consts';
import { SHOW_GAME_VIEWER_EVENT } from '@/components/viewer/utils';

const GameViewerDialog = dynamic(
  () => import('@/components/viewer/GameViewerModal').then((mod) => mod.GameViewerModal),
  {
    ssr: false,
  }
);

type GameViewerProps = {
  translations: Translations;
  showCountry?: boolean;
};

export function GameViewer({ translations, showCountry }: GameViewerProps) {
  const [sgfPath, setSgfPath] = useState<string | null>(null);
  const close = useCallback(() => setSgfPath(null), []);

  useEffect(() => {
    document.addEventListener(SHOW_GAME_VIEWER_EVENT, showListener);
    return () => document.removeEventListener(SHOW_GAME_VIEWER_EVENT, showListener);

    function showListener(event: Event) {
      setSgfPath((event as CustomEvent).detail);
    }
  }, []);

  if (!sgfPath) {
    return null;
  }

  return <GameViewerDialog sgfPath={sgfPath} translations={translations} showCountry={showCountry} onClose={close} />;
}
