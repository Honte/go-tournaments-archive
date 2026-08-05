'use client';

import { useStore } from 'zustand';
import type { Translator } from '@/i18n/consts';
import type { GameSort } from '@/libs/gameRecords';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function SortFacet({ store, t }: GameFacetProps) {
  const value = useStore(store, (state) => state.model.state.sort);
  const setFilters = useStore(store, (state) => state.setFilters);
  const options = getSortOptions(t);

  return (
    <FacetSelect
      id="game-sort"
      label={t('gamesFilter.sort')}
      value={value}
      options={options.map((option) => ({ ...option, count: 1 }))}
      onChange={(sort) => sort && setFilters({ sort: sort as typeof value })}
      name="sort"
      showCounts={false}
      searchable={false}
      clearable={false}
    />
  );
}

function getSortOptions(t: Translator): { value: GameSort; label: string }[] {
  return [
    { value: 'year-desc', label: t('gamesFilter.newest') },
    { value: 'year-asc', label: t('gamesFilter.oldest') },
    { value: 'moves-desc', label: t('gamesFilter.mostMoves') },
    { value: 'moves-asc', label: t('gamesFilter.fewestMoves') },
    { value: 'black-rank-desc', label: t('gamesFilter.strongestBlack') },
    { value: 'black-rank-asc', label: t('gamesFilter.weakestBlack') },
    { value: 'white-rank-desc', label: t('gamesFilter.strongestWhite') },
    { value: 'white-rank-asc', label: t('gamesFilter.weakestWhite') },
    { value: 'rank-gap-asc', label: t('gamesFilter.closestRanks') },
    { value: 'rank-gap-desc', label: t('gamesFilter.widestRanks') },
  ];
}
