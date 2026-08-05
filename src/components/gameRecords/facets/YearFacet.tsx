'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand';
import { MultiFacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function YearFacet({ store, t }: GameFacetProps) {
  const years = useStore(store, (state) => state.model.facets.year.options);
  const selectedYears = useStore(store, (state) => state.model.state.years);
  const setFilters = useStore(store, (state) => state.setFilters);
  const values = useMemo(() => selectedYears.map(String), [selectedYears]);

  return (
    <MultiFacetSelect
      id="game-year"
      label={t('gamesFilter.year')}
      options={years}
      values={values}
      onChange={(next) => setFilters({ years: next.map(Number).toSorted((left, right) => left - right) })}
      placeholder={t('gamesFilter.anyYear')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="year"
    />
  );
}
