'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import type { GameFacetProps } from './types';

type PartnerFacetProps = GameFacetProps & {
  opponent?: boolean;
};

export function PartnerFacet({ store, t, opponent = false }: PartnerFacetProps) {
  const key = opponent ? 'opponentPartner' : 'partner';
  const facet = useStore(store, (state) => state.model.facets[key]);
  const value = useStore(store, (state) => state.model.state[key]);
  const setFilters = useStore(store, (state) => state.setFilters);

  if (!facet.visible) {
    return null;
  }

  return (
    <FacetSelect
      id={`game-${key}`}
      name={key}
      label={t(`gamesFilter.${key}`)}
      options={facet.options}
      value={value ?? null}
      onChange={(value) => setFilters({ [key]: value ?? undefined })}
      placeholder={t('gamesFilter.anyPlayer')}
      noOptionsMessage={t('gamesFilter.noOptions')}
    />
  );
}
