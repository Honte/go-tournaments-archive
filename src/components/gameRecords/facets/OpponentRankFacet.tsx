'use client';

import { useStore } from 'zustand';
import { RankRange } from './RankRange';
import type { GameFacetProps } from './types';

export function OpponentRankFacet({ store, t }: GameFacetProps) {
  const pairs = useStore(store, (storeState) => storeState.options.pairs);
  const state = useStore(store, (storeState) => storeState.model.state);
  const ranks = useStore(store, (storeState) => storeState.model.domains.ranks);
  const setFilters = useStore(store, (storeState) => storeState.setFilters);

  return (
    <RankRange
      id="game-opponent-rank"
      label={t(pairs ? 'gamesFilter.opponentPairRank' : 'gamesFilter.opponentRank')}
      ranks={ranks}
      minimum={state.opponentRankMin}
      maximum={state.opponentRankMax}
      minimumLabel={t('gamesFilter.minimum')}
      maximumLabel={t('gamesFilter.maximum')}
      anyLabel={t('gamesFilter.anyRank')}
      onChange={(opponentRankMin, opponentRankMax) => setFilters({ opponentRankMin, opponentRankMax })}
    />
  );
}
