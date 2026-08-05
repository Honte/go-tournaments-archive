'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

export function PlayerFacet({ store, t }: GameFacetProps) {
  const facet = useStore(store, (state) => state.model.facets.player);
  const value = useStore(store, (state) => state.model.state.player);
  const setFilters = useStore(store, (state) => state.setFilters);

  return (
    <FacetSelect
      id="game-player"
      label={t('gamesFilter.player')}
      options={facet.options}
      value={value ?? null}
      onChange={(player) => setFilters({ player: player ?? undefined })}
      placeholder={t('gamesFilter.anyPlayer')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="player"
    />
  );
}
