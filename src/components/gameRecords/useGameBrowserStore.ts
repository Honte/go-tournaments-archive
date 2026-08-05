'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import {
  connectGameRecordsUrlState,
  createGameRecordsStore,
  parseGameBrowserState,
  type GameBrowserOptions,
  type GameRecordsStoreApi,
} from '@/libs/gameRecords';

export function useGameBrowserStore(games: readonly ApiGameInfo[], options: GameBrowserOptions) {
  const searchParams = useSearchParams();
  const storeRef = useRef<GameRecordsStoreApi | null>(null);

  if (
    !storeRef.current ||
    storeRef.current.getState().games !== games ||
    storeRef.current.getState().options !== options
  ) {
    storeRef.current = createGameRecordsStore({
      games,
      options,
      initialState: parseGameBrowserState(searchParams),
    });
  }

  const store = storeRef.current;

  useEffect(() => connectGameRecordsUrlState(store), [store]);

  return store;
}
