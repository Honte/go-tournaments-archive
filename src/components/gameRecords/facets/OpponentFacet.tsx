'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function OpponentFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.opponent);
  const value = useStore(store, (state) => state.model.state.opponent);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <FacetSelect
      id="game-opponent"
      label={t('gamesFilter.opponent')}
      options={facet.options}
      value={value ?? null}
      onChange={(opponent) => setFilters({ opponent: opponent ?? undefined })}
      placeholder={t('gamesFilter.anyOpponent')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="opponent"
    />
  );
}
