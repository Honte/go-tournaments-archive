'use client';

import { useStore } from 'zustand';
import { DualRange } from '@/components/ui/DualRange';
import type { GameFacetProps } from './types';

export function MovesFacet({ store, t }: GameFacetProps) {
  const state = useStore(store, (storeState) => storeState.model.state);
  const domains = useStore(store, (storeState) => storeState.model.domains);
  const setFilters = useStore(store, (storeState) => storeState.setFilters);
  const domainMinimum = domains.movesMin ?? 0;
  const domainMaximum = domains.movesMax ?? 0;

  return (
    <DualRange
      id="game-moves"
      label={t('gamesFilter.moves')}
      minimum={domainMinimum}
      maximum={domainMaximum}
      lowerValue={state.movesMin ?? domainMinimum}
      upperValue={state.movesMax ?? domainMaximum}
      lowerLabel={`${t('gamesFilter.moves')}: ${t('gamesFilter.minimum')}`}
      upperLabel={`${t('gamesFilter.moves')}: ${t('gamesFilter.maximum')}`}
      disabled={domainMinimum >= domainMaximum}
      onCommit={(lowerValue, upperValue) =>
        setFilters({
          movesMin: lowerValue === domainMinimum ? undefined : lowerValue,
          movesMax: upperValue === domainMaximum ? undefined : upperValue,
        })
      }
    />
  );
}
