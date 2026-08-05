'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function OpponentCountryFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.opponentCountry);
  const value = useStore(store, (state) => state.model.state.opponentCountry);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <FacetSelect
      id="game-opponent-country"
      label={t('gamesFilter.opponentCountry')}
      options={facet.options}
      value={value ?? null}
      onChange={(opponentCountry) => setFilters({ opponentCountry: opponentCountry ?? undefined })}
      placeholder={t('gamesFilter.anyOpponentCountry')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="opponentCountry"
    />
  );
}
