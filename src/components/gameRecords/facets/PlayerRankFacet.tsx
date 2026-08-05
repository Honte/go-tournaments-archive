'use client';

import { useStore } from 'zustand';
import { RankRange } from './RankRange';
import type { GameFacetProps } from './types';

export function PlayerRankFacet({ store, t }: GameFacetProps) {
  const state = useStore(store, (storeState) => storeState.model.state);
  const ranks = useStore(store, (storeState) => storeState.model.domains.ranks);
  const setFilters = useStore(store, (storeState) => storeState.setFilters);

  return (
    <RankRange
      id="game-player-rank"
      label={t('gamesFilter.playerRank')}
      ranks={ranks}
      minimum={state.playerRankMin}
      maximum={state.playerRankMax}
      minimumLabel={t('gamesFilter.minimum')}
      maximumLabel={t('gamesFilter.maximum')}
      anyLabel={t('gamesFilter.anyRank')}
      onChange={(playerRankMin, playerRankMax) => setFilters({ playerRankMin, playerRankMax })}
    />
  );
}
