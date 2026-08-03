'use client';

import { useCallback, useState } from 'react';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  DEFAULT_GAME_BROWSER_STATE,
  GAME_MEDIA,
  GAME_RESULT_TYPES,
  type GameBrowserModel,
  type GameBrowserState,
  type GameGroup,
  type GameMedia,
  type GameResultType,
  type GameSort,
  type GameWinner,
  getActiveGameFilterCount,
} from '@/libs/gameRecords';
import { FilterToggleGroup } from '@/components/gameRecords/FilterToggleGroup';
import { GameBrowserToolbar } from '@/components/gameRecords/GameBrowserToolbar';
import { GameYearSelect } from '@/components/gameRecords/GameYearSelect';
import { MovesRange } from '@/components/gameRecords/MovesRange';
import { RankRange } from '@/components/gameRecords/RankRange';
import { FacetSelect, MultiFacetSelect } from '@/components/ui/FacetSelect';

export type GameFiltersPanelProps = {
  model: GameBrowserModel;
  translations: Translations;
  onChange: (state: GameBrowserState) => void;
  onClear: () => void;
};

const columnClassName = 'min-w-0 space-y-4';
const FILTER_PANEL_ID = 'game-record-filters';
const ADVANCED_FILTERS_ID = `${FILTER_PANEL_ID}-advanced`;

export function GameFiltersPanel({ model, onChange, onClear, translations }: GameFiltersPanelProps) {
  const { state, facets, domains, grouping, hasJigo } = model;
  const t = getTranslator(translations);

  const activeCount = getActiveGameFilterCount(state);
  const [expanded, setExpanded] = useState(() => activeCount > 0);

  const hiddenFilterCount =
    activeCount -
    [
      state.player,
      state.sort !== DEFAULT_GAME_BROWSER_STATE.sort,
      state.group !== DEFAULT_GAME_BROWSER_STATE.group,
    ].filter(Boolean).length;

  const disclosureLabel = `${t(expanded ? 'gamesFilter.showLess' : 'gamesFilter.showMore')}${
    !expanded && hiddenFilterCount > 0 ? ` (${hiddenFilterCount})` : ''
  }`;

  const patch = useCallback(
    (values: Partial<GameBrowserState>) => onChange({ ...state, ...values }),
    [state, onChange]
  );

  const resultLabels: Record<GameResultType, string> = {
    resignation: t('gamesFilter.resignation'),
    points: t('gamesFilter.points'),
    time: t('gamesFilter.time'),
    other: t('gamesFilter.other'),
    unknown: t('gamesFilter.unknown'),
  };

  const mediaLabels: Record<GameMedia, string> = {
    ogs: t('gamesFilter.hasOgs'),
    yt: t('gamesFilter.hasYoutube'),
    ai: t('gamesFilter.hasAi'),
  };

  const colorOptions = [
    { value: 'black', label: t('gamesFilter.black'), count: facets.playerColor.black },
    { value: 'white', label: t('gamesFilter.white'), count: facets.playerColor.white },
  ];

  const sortOptions = getSortOptions(t);
  const groupOptions = getGroupOptions(t, grouping);

  const focalSelected = Boolean(state.player || state.country);
  const playerLabel = facets.player.options.find((option) => option.value === state.player)?.label;
  const opponentLabel = facets.opponent.options.find((option) => option.value === state.opponent)?.label;
  const countryLabel = state.country ? t(`country.${state.country}`) : undefined;
  const opponentCountryLabel = state.opponentCountry ? t(`country.${state.opponentCountry}`) : undefined;

  const winnerOptions = [
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
    <section id={FILTER_PANEL_ID} className="rounded-md border border-event-soft bg-white p-3 shadow-sm md:p-4">
      {!expanded && (
        <div className="flex max-sm:flex-col flex-wrap gap-4">
          <FacetSelect
            id="game-player"
            label={t('gamesFilter.player')}
            options={facets.player.options}
            value={state.player ?? null}
            onChange={(player) => patch({ player: player ?? undefined })}
            placeholder={t('gamesFilter.anyPlayer')}
            noOptionsMessage={t('gamesFilter.noOptions')}
            name="player"
            className="min-w-56 flex-1 sm:max-w-sm"
          />
          <GameBrowserToolbar
            activeCount={activeCount}
            disclosureLabel={disclosureLabel}
            expanded={expanded}
            groupOptions={groupOptions}
            onClear={onClear}
            onPatch={patch}
            onToggle={() => setExpanded((open) => !open)}
            sortOptions={sortOptions}
            state={state}
            t={t}
          />
        </div>
      )}

      {expanded && (
        <div id={ADVANCED_FILTERS_ID}>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <section aria-labelledby={`${FILTER_PANEL_ID}-player-heading`} className={columnClassName}>
              <h2
                id={`${FILTER_PANEL_ID}-player-heading`}
                className="border-b border-event-soft pb-2 text-base font-bold"
              >
                {t('gamesFilter.playerFilters')}
              </h2>

              <FacetSelect
                id="game-player"
                label={t('gamesFilter.player')}
                options={facets.player.options}
                value={state.player ?? null}
                onChange={(player) => patch({ player: player ?? undefined })}
                placeholder={t('gamesFilter.anyPlayer')}
                noOptionsMessage={t('gamesFilter.noOptions')}
                name="player"
              />

              {facets.country.visible && (
                <FacetSelect
                  id="game-country"
                  label={t('gamesFilter.country')}
                  options={facets.country.options}
                  value={state.country ?? null}
                  onChange={(country) => patch({ country: country ?? undefined })}
                  placeholder={t('gamesFilter.anyCountry')}
                  noOptionsMessage={t('gamesFilter.noOptions')}
                  name="country"
                />
              )}

              <RankRange
                id="game-player-rank"
                label={t('gamesFilter.playerRank')}
                ranks={domains.ranks}
                minimum={state.playerRankMin}
                maximum={state.playerRankMax}
                minimumLabel={t('gamesFilter.minimum')}
                maximumLabel={t('gamesFilter.maximum')}
                anyLabel={t('gamesFilter.anyRank')}
                onChange={(playerRankMin, playerRankMax) => patch({ playerRankMin, playerRankMax })}
              />

              <FacetSelect
                id="game-player-color"
                label={t('gamesFilter.playerColor')}
                options={colorOptions}
                value={state.playerColor ?? null}
                onChange={(playerColor) =>
                  patch({ playerColor: playerColor === 'black' || playerColor === 'white' ? playerColor : undefined })
                }
                placeholder={t('gamesFilter.anyColor')}
                noOptionsMessage={t('gamesFilter.noOptions')}
                name="playerColor"
                searchable={false}
                allowZeroCountOptions={true}
              />
            </section>

            <section aria-labelledby={`${FILTER_PANEL_ID}-opponent-heading`} className={columnClassName}>
              <h2
                id={`${FILTER_PANEL_ID}-opponent-heading`}
                className="border-b border-event-soft pb-2 text-base font-bold"
              >
                {t('gamesFilter.opponentFilters')}
              </h2>

              {facets.opponent.visible && (
                <FacetSelect
                  id="game-opponent"
                  label={t('gamesFilter.opponent')}
                  options={facets.opponent.options}
                  value={state.opponent ?? null}
                  onChange={(opponent) => patch({ opponent: opponent ?? undefined })}
                  placeholder={t('gamesFilter.anyOpponent')}
                  noOptionsMessage={t('gamesFilter.noOptions')}
                  name="opponent"
                />
              )}

              {facets.opponentCountry.visible && (
                <FacetSelect
                  id="game-opponent-country"
                  label={t('gamesFilter.opponentCountry')}
                  options={facets.opponentCountry.options}
                  value={state.opponentCountry ?? null}
                  onChange={(opponentCountry) => patch({ opponentCountry: opponentCountry ?? undefined })}
                  placeholder={t('gamesFilter.anyOpponentCountry')}
                  noOptionsMessage={t('gamesFilter.noOptions')}
                  name="opponentCountry"
                />
              )}

              {focalSelected ? (
                <RankRange
                  id="game-opponent-rank"
                  label={t('gamesFilter.opponentRank')}
                  ranks={domains.ranks}
                  minimum={state.opponentRankMin}
                  maximum={state.opponentRankMax}
                  minimumLabel={t('gamesFilter.minimum')}
                  maximumLabel={t('gamesFilter.maximum')}
                  anyLabel={t('gamesFilter.anyRank')}
                  onChange={(opponentRankMin, opponentRankMax) => patch({ opponentRankMin, opponentRankMax })}
                />
              ) : (
                <p className="text-sm text-event-dark/70">
                  {t(facets.country.visible ? 'gamesFilter.selectPlayerOrCountry' : 'gamesFilter.selectPlayer')}
                </p>
              )}
            </section>

            <section aria-labelledby={`${FILTER_PANEL_ID}-game-heading`} className={columnClassName}>
              <h2
                id={`${FILTER_PANEL_ID}-game-heading`}
                className="border-b border-event-soft pb-2 text-base font-bold"
              >
                {t('gamesFilter.gameFilters')}
              </h2>

              <GameYearSelect
                id="game-year"
                label={t('gamesFilter.year')}
                years={facets.year.options}
                selectedYears={state.years}
                placeholder={t('gamesFilter.anyYear')}
                noOptionsMessage={t('gamesFilter.noOptions')}
                onChange={(years) => patch({ years })}
              />

              {facets.category.visible && (
                <FacetSelect
                  id="game-category"
                  label={t('gamesFilter.category')}
                  options={facets.category.options}
                  value={state.category ?? null}
                  onChange={(category) => patch({ category: category ?? undefined })}
                  placeholder={t('gamesFilter.anyCategory')}
                  noOptionsMessage={t('gamesFilter.noOptions')}
                  name="category"
                />
              )}

              <MovesRange
                id="game-moves"
                label={t('gamesFilter.moves')}
                minimum={state.movesMin}
                maximum={state.movesMax}
                domainMinimum={domains.movesMin}
                domainMaximum={domains.movesMax}
                minimumLabel={t('gamesFilter.minimum')}
                maximumLabel={t('gamesFilter.maximum')}
                onChange={(movesMin, movesMax) => patch({ movesMin, movesMax })}
              />

              <FacetSelect
                id="game-winner"
                label={t('gamesFilter.winner')}
                options={winnerOptions}
                value={state.winner ?? null}
                onChange={(winner) => patch({ winner: winner && isGameWinner(winner) ? winner : undefined })}
                placeholder={t('gamesFilter.anyWinner')}
                noOptionsMessage={t('gamesFilter.noOptions')}
                name="winner"
                searchable={false}
                allowZeroCountOptions={true}
              />

              <MultiFacetSelect
                id="game-result"
                label={t('gamesFilter.resultType')}
                options={GAME_RESULT_TYPES.map((result) => ({
                  value: result,
                  label: resultLabels[result],
                  count: facets.result[result],
                }))}
                values={state.results}
                onChange={(results) => patch({ results: results.filter(isGameResultType) })}
                placeholder={t('gamesFilter.anyResult')}
                noOptionsMessage={t('gamesFilter.noOptions')}
                name="result"
                searchable={false}
                allowZeroCountOptions={true}
              />

              {facets.komi.visible && (
                <MultiFacetSelect
                  id="game-komi"
                  label={t('gamesFilter.komi')}
                  options={facets.komi.options}
                  values={state.komi}
                  onChange={(komi) => patch({ komi })}
                  placeholder={t('gamesFilter.anyKomi')}
                  noOptionsMessage={t('gamesFilter.noOptions')}
                  name="komi"
                  searchable={false}
                />
              )}

              <FilterToggleGroup
                legend={t('gamesFilter.media')}
                values={GAME_MEDIA}
                selected={state.media}
                labels={mediaLabels}
                counts={facets.media}
                disableZero={true}
                onChange={(media) => patch({ media })}
              />
            </section>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 flex max-sm:flex-col flex-wrap gap-4 border-t border-event-soft pt-4">
          <GameBrowserToolbar
            activeCount={activeCount}
            disclosureLabel={disclosureLabel}
            expanded={expanded}
            groupOptions={groupOptions}
            onClear={onClear}
            onPatch={patch}
            onToggle={() => setExpanded((open) => !open)}
            sortOptions={sortOptions}
            state={state}
            t={t}
          />
        </div>
      )}
    </section>
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

function isGameWinner(value: string): value is GameWinner {
  return (
    value === 'black' ||
    value === 'white' ||
    value === 'jigo' ||
    value === 'player' ||
    value === 'player-opponent' ||
    value === 'country' ||
    value === 'country-opponent'
  );
}

function isGameResultType(value: string): value is GameResultType {
  return value === 'resignation' || value === 'points' || value === 'time' || value === 'other' || value === 'unknown';
}
