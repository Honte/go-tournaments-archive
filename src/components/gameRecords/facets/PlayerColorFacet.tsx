'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function PlayerColorFacet({ store, t }: GameFacetProps) {
  const counts = useStore(store, (state) => state.model.facets.playerColor);
  const value = useStore(store, (state) => state.model.state.playerColor);
  const setFilters = useStore(store, (state) => state.setFilters);
  const options = [
    { value: 'black', label: t('gamesFilter.black'), count: counts.black },
    { value: 'white', label: t('gamesFilter.white'), count: counts.white },
  ];

  return (
    <FacetSelect
      id="game-player-color"
      label={t('gamesFilter.playerColor')}
      options={options}
      value={value ?? null}
      onChange={(playerColor) =>
        setFilters({
          playerColor: playerColor === 'black' || playerColor === 'white' ? playerColor : undefined,
        })
      }
      placeholder={t('gamesFilter.anyColor')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="playerColor"
      searchable={false}
      allowZeroCountOptions={true}
    />
  );
}
