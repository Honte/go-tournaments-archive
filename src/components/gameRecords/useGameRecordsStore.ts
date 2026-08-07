'use client';

import { useEffect, useState } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import { createGameRecordsStore, type GameRecordsOptions, type GameRecordsStoreApi } from '@/libs/gameRecords';

export function useGameRecordsStore(games: readonly ApiGameInfo[], options: GameRecordsOptions) {
  const [store] = useState<GameRecordsStoreApi>(() =>
    createGameRecordsStore({
      games,
      options,
    })
  );

  useEffect(() => store.listen(), [store]);

  return store;
}
