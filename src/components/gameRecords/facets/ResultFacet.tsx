'use client';

import { useStore } from 'zustand';
import { GAME_RESULT_TYPES, type GameResultType } from '@/libs/gameRecords';
import { MultiFacetSelect } from '@/components/ui/FacetSelect';
import { isGameResultType } from './guards';
import type { GameFacetProps } from './types';

export function ResultFacet({ store, t }: GameFacetProps) {
  const selected = useStore(store, (state) => state.model.state.results);
  const counts = useStore(store, (state) => state.model.facets.result);
  const setFilters = useStore(store, (state) => state.setFilters);
  const labels: Record<GameResultType, string> = {
    resignation: t('gamesFilter.resignation'),
    points: t('gamesFilter.points'),
    time: t('gamesFilter.time'),
    other: t('gamesFilter.other'),
    unknown: t('gamesFilter.unknown'),
  };

  return (
    <MultiFacetSelect
      id="game-result"
      label={t('gamesFilter.resultType')}
      options={GAME_RESULT_TYPES.map((result) => ({ value: result, label: labels[result], count: counts[result] }))}
      values={selected}
      onChange={(results) => setFilters({ results: results.filter(isGameResultType) })}
      placeholder={t('gamesFilter.anyResult')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="result"
      searchable={false}
      allowZeroCountOptions={true}
    />
  );
}
