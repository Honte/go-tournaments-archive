'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef } from 'react';
import type { Translations } from '@/i18n/consts';
import { getClosedViewerSearch } from '@/components/viewer/utils';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const sgfPath = searchParams.get('sgf');
  const previousSgfPathRef = useRef(sgfPath);
  const openedFromPageRef = useRef(false);

  useEffect(() => {
    if (!previousSgfPathRef.current && sgfPath) {
      openedFromPageRef.current = true;
    }

    if (!sgfPath) {
      openedFromPageRef.current = false;
    }

    previousSgfPathRef.current = sgfPath;
  }, [sgfPath]);

  const close = useCallback(() => {
    if (openedFromPageRef.current) {
      openedFromPageRef.current = false;
      router.back();
      return;
    }

    router.replace(getClosedViewerSearch(searchParams), { scroll: false });
  }, [router, searchParams]);

  if (!sgfPath) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GameViewerDialog sgfPath={sgfPath} translations={translations} onClose={close} />;
    </Suspense>
  );
}
