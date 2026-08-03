'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import {
  deriveGameBrowserModel,
  parseGameBrowserState,
  serializeGameBrowserState,
  type GameBrowserOptions,
  type GameBrowserState,
} from '@/libs/gameRecords';

export function useGameBrowserUrlState(games: readonly ApiGameInfo[], options: GameBrowserOptions) {
  const searchParams = useSearchParams();
  const requestedState = useMemo(() => parseGameBrowserState(searchParams), [searchParams]);
  const model = useMemo(() => deriveGameBrowserModel(games, requestedState, options), [games, options, requestedState]);

  useEffect(() => {
    const current = new URLSearchParams(searchParams.toString());
    const canonical = serializeGameBrowserState(model.state, current);

    if (canonical.toString() !== current.toString()) {
      updateBrowserUrl(canonical, 'replace');
    }
  }, [model.state, searchParams]);

  const commitState = useCallback(
    (requested: GameBrowserState) => {
      const normalized = deriveGameBrowserModel(games, requested, options).state;
      const current = new URLSearchParams(window.location.search);
      const next = serializeGameBrowserState(normalized, current);

      if (next.toString() !== current.toString()) {
        const scrollTop = window.scrollY;
        updateBrowserUrl(next, 'push');
        preserveWindowScroll(scrollTop);
      }
    },
    [games, options]
  );

  return { commitState, model };
}

function updateBrowserUrl(params: URLSearchParams, method: 'push' | 'replace') {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;

  window.history[`${method}State`](null, '', url);
}

function preserveWindowScroll(scrollTop: number) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollTop)));
}
