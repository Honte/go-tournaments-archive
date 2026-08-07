'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function CountryFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.country);
  const value = useStore(store, (state) => state.model.state.country);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <FacetSelect
      id="game-country"
      label={t('gamesFilter.country')}
      options={facet.options}
      value={value ?? null}
      onChange={(country) => setFilters({ country: country ?? undefined })}
      placeholder={t('gamesFilter.anyCountry')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="country"
    />
  );
}
