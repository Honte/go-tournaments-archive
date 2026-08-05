'use client';

import { useStore } from 'zustand';
import { MultiFacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function KomiFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.komi);
  const selected = useStore(store, (state) => state.model.state.komi);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <MultiFacetSelect
      id="game-komi"
      label={t('gamesFilter.komi')}
      options={facet.options}
      values={selected}
      onChange={(komi) => setFilters({ komi })}
      placeholder={t('gamesFilter.anyKomi')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="komi"
      searchable={false}
    />
  );
}
