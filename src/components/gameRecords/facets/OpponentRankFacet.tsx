'use client';

import { useStore } from 'zustand';
import { RankRange } from './RankRange';
import type { GameFacetProps } from './types';

export function OpponentRankFacet({ store, t }: GameFacetProps) {
  const state = useStore(store, (storeState) => storeState.model.state);
  const ranks = useStore(store, (storeState) => storeState.model.domains.ranks);
  const countryVisible = useStore(store, (storeState) => storeState.model.facets.country.visible);
  const setFilters = useStore(store, (storeState) => storeState.setFilters);

  if (!state.player && !state.country) {
    return (
      <p className="text-sm text-event-dark/70">
        {t(countryVisible ? 'gamesFilter.selectPlayerOrCountry' : 'gamesFilter.selectPlayer')}
      </p>
    );
  }

  return (
    <RankRange
      id="game-opponent-rank"
      label={t('gamesFilter.opponentRank')}
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
