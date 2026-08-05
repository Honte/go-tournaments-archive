'use client';

import { useStore } from 'zustand';
import type { Translator } from '@/i18n/consts';
import type { GameBrowserModel, GameGroup } from '@/libs/gameRecords';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function GroupFacet({ store, t }: GameFacetProps) {
  const value = useStore(store, (state) => state.model.state.group);
  const grouping = useStore(store, (state) => state.model.grouping);
  const setFilters = useStore(store, (state) => state.setFilters);
  const options = getGroupOptions(t, grouping);

  return (
    <FacetSelect
      id="game-group"
      label={t('gamesFilter.group')}
      value={value}
      options={options.map((option) => ({ ...option, count: 1 }))}
      onChange={(group) => group && setFilters({ group: group as typeof value })}
      name="group"
      showCounts={false}
      searchable={false}
      clearable={false}
    />
  );
}

function getGroupOptions(t: Translator, grouping: GameBrowserModel['grouping']): { value: GameGroup; label: string }[] {
  return [
    { value: 'none', label: t('gamesFilter.noGrouping') },
    { value: 'year', label: t('gamesFilter.groupYear') },
    grouping.opponentPlayer && { value: 'opponent-player' as const, label: t('gamesFilter.groupOpponent') },
    grouping.opponentCountry && {
      value: 'opponent-country' as const,
      label: t('gamesFilter.groupOpponentCountry'),
    },
    grouping.countryPlayer && {
      value: 'country-player' as const,
      label: t('gamesFilter.groupCountryPlayer'),
    },
    grouping.category && { value: 'category' as const, label: t('gamesFilter.groupCategory') },
  ].filter((option): option is { value: GameGroup; label: string } => Boolean(option));
}
