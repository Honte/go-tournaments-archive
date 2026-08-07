'use client';

import { useStore } from 'zustand';
import { FacetSelect } from '@/components/ui/FacetSelect';
import { isGameWinner } from './guards';
import type { GameFacetProps } from './types';

export function WinnerFacet({ store, t }: GameFacetProps) {
  const state = useStore(store, (storeState) => storeState.model.state);
  const facets = useStore(store, (storeState) => storeState.model.facets);
  const hasJigo = useStore(store, (storeState) => storeState.model.hasJigo);
  const setFilters = useStore(store, (storeState) => storeState.setFilters);
  const playerLabel = facets.player.options.find((option) => option.value === state.player)?.label;
  const opponentLabel = facets.opponent.options.find((option) => option.value === state.opponent)?.label;
  const countryLabel = state.country ? t(`country.${state.country}`) : undefined;
  const opponentCountryLabel = state.opponentCountry ? t(`country.${state.opponentCountry}`) : undefined;
  const options = [
    { value: 'black', label: t('gamesFilter.black'), count: facets.winner.black },
    { value: 'white', label: t('gamesFilter.white'), count: facets.winner.white },
    ...(hasJigo ? [{ value: 'jigo', label: t('gamesFilter.jigo'), count: facets.winner.jigo }] : []),
    ...(state.player
      ? [
          {
            value: 'player',
            label: t('gamesFilter.playerWinner', playerLabel ?? t('gamesFilter.player')),
            count: facets.winner.player,
          },
          {
            value: 'player-opponent',
            label: opponentLabel ?? t('gamesFilter.opponentWinner', playerLabel ?? t('gamesFilter.player')),
            count: facets.winner['player-opponent'],
          },
        ]
      : []),
    ...(state.country
      ? [
          {
            value: 'country',
            label: t('gamesFilter.countryPlayerWinner', countryLabel!),
            count: facets.winner.country,
          },
          {
            value: 'country-opponent',
            label: opponentCountryLabel ?? t('gamesFilter.countryOpponentWinner', countryLabel!),
            count: facets.winner['country-opponent'],
          },
        ]
      : []),
  ];

  return (
    <FacetSelect
      id="game-winner"
      label={t('gamesFilter.winner')}
      options={options}
      value={state.winner ?? null}
      onChange={(winner) => setFilters({ winner: winner && isGameWinner(winner) ? winner : undefined })}
      placeholder={t('gamesFilter.anyWinner')}
      noOptionsMessage={t('gamesFilter.noOptions')}
      name="winner"
      searchable={false}
      allowZeroCountOptions={true}
    />
  );
}
