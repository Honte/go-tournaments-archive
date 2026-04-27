'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type { Translations } from '@/i18n/consts';
import { type GameViewerPayload, SHOW_GAME_VIEWER_EVENT } from '@/components/viewer/schema';

const GameViewerDialog = dynamic(
  () => import('@/components/viewer/GameViewerModal').then((mod) => mod.GameViewerModal),
  {
    ssr: false,
  }
);

type GameViewerProps = {
  translations: Translations;
};

export function GameViewer({ translations }: GameViewerProps) {
  const [state, setState] = useState<GameViewerPayload | null>(null);
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    const showListener = (event: Event) => {
      const detail = (event as CustomEvent<GameViewerPayload>).detail;

      if (!detail?.props?.sgf) {
        return;
      }

      setState(detail);
    };

    document.addEventListener(SHOW_GAME_VIEWER_EVENT, showListener);
    return () => document.removeEventListener(SHOW_GAME_VIEWER_EVENT, showListener);
  }, []);

  if (!state) {
    return null;
  }

  return <GameViewerDialog payload={state} translations={translations} onClose={close} />;
}
