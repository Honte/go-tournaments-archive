'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function CategoryFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.category);
  const value = useStore(store, (state) => state.model.state.category);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <FacetSelect
      id="game-category"
      label={t('gamesFilter.category')}
      options={facet.options}
      value={value ?? null}
      onChange={(category) => setFilters({ category: category ?? undefined })}
      placeholder={t('gamesFilter.anyCategory')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="category"
    />
  );
}
