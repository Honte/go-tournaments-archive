'use client';

import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
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
} from '@/components/stats/allGamesModel';
import { GameDualRange } from '@/components/stats/GameDualRange';
import { GameFacetSelect } from '@/components/stats/GameFacetSelect';
import { GameYearSelect } from '@/components/stats/GameYearSelect';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';

export type GameFiltersPanelProps = {
  id: string;
  model: GameBrowserModel;
  translations: Translations;
  onChange: (state: GameBrowserState) => void;
  onClear: () => void;
};

const inputClassName =
  'min-h-9 w-full rounded-sm border border-event-soft bg-white px-2 py-1 text-sm text-event-dark focus:border-event-primary focus:outline-none focus:ring-1 focus:ring-event-primary';
const columnClassName = 'min-w-0 space-y-4 rounded-md border border-event-soft bg-event-light/35 p-3';

export function GameFiltersPanel({ id, model, onChange, onClear, translations }: GameFiltersPanelProps) {
  const t = getTranslator(translations);
  const { state, facets, domains, grouping } = model;
  const activeCount = getActiveGameFilterCount(state);
  const patch = (values: Partial<GameBrowserState>) => onChange({ ...state, ...values });
  const resultLabels: Record<GameResultType, string> = {
    resignation: t('gamesFilter.resignation'),
    points: t('gamesFilter.points'),
    time: t('gamesFilter.time'),
    other: t('gamesFilter.other'),
  };
  const mediaLabels: Record<GameMedia, string> = {
    ogs: t('gamesFilter.hasOgs'),
    yt: t('gamesFilter.hasYoutube'),
    ai: t('gamesFilter.hasAi'),
  };
  const sortOptions = getSortOptions(t);
  const groupOptions = getGroupOptions(t, grouping);
  const focalSelected = Boolean(state.player || state.country);

  return (
    <section id={id} className="rounded-md border border-event-soft bg-white p-3 shadow-sm md:p-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <section aria-labelledby={`${id}-player-heading`} className={columnClassName}>
          <h2 id={`${id}-player-heading`} className="border-b border-event-soft pb-2 text-base font-bold">
            {t('gamesFilter.playerFilters')}
          </h2>

          <GameFacetSelect
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
            <GameFacetSelect
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
        </section>

        <section aria-labelledby={`${id}-opponent-heading`} className={columnClassName}>
          <h2 id={`${id}-opponent-heading`} className="border-b border-event-soft pb-2 text-base font-bold">
            {t('gamesFilter.opponentFilters')}
          </h2>

          {facets.opponent.visible && (
            <GameFacetSelect
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
            <GameFacetSelect
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
            <p className="text-sm text-event-dark/70">{t('gamesFilter.selectPlayerOrCountry')}</p>
          )}
        </section>

        <section aria-labelledby={`${id}-game-heading`} className={columnClassName}>
          <h2 id={`${id}-game-heading`} className="border-b border-event-soft pb-2 text-base font-bold">
            {t('gamesFilter.gameFilters')}
          </h2>

          <GameYearSelect
            id="game-year"
            label={t('gamesFilter.year')}
            years={domains.years}
            selectedYears={state.years}
            placeholder={t('gamesFilter.anyYear')}
            noOptionsMessage={t('gamesFilter.noOptions')}
            onChange={(years) => patch({ years })}
          />

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

          <ToggleGroup
            legend={t('gamesFilter.resultType')}
            values={GAME_RESULT_TYPES}
            selected={state.results}
            labels={resultLabels}
            onChange={(results) => patch({ results })}
          />

          <SelectField
            id="game-winner"
            label={t('gamesFilter.winner')}
            value={state.winner ?? ''}
            options={[
              { value: '', label: t('gamesFilter.anyWinner') },
              { value: 'black', label: t('gamesFilter.black') },
              { value: 'white', label: t('gamesFilter.white') },
              ...(state.player
                ? [
                    { value: 'player', label: t('gamesFilter.player') },
                    { value: 'opponent', label: t('gamesFilter.opponent') },
                  ]
                : []),
            ]}
            onChange={(winner) => patch({ winner: isGameWinner(winner) ? winner : undefined })}
          />

          <ToggleGroup
            legend={t('gamesFilter.media')}
            values={GAME_MEDIA}
            selected={state.media}
            labels={mediaLabels}
            onChange={(media) => patch({ media })}
          />
        </section>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-event-soft pt-4">
        <SelectField
          id="game-sort"
          label={t('gamesFilter.sort')}
          value={state.sort}
          options={sortOptions}
          className="min-w-56 flex-1 sm:max-w-sm"
          onChange={(sort) => patch({ sort: sort as GameSort })}
        />

        <SelectField
          id="game-group"
          label={t('gamesFilter.group')}
          value={state.group}
          options={groupOptions}
          className="min-w-56 flex-1 sm:max-w-sm"
          onChange={(group) => patch({ group: group as GameGroup })}
        />

        <Button
          type="button"
          onClick={onClear}
          disabled={!activeCount}
          className="ml-auto text-sm disabled:cursor-default disabled:opacity-50"
        >
          {t('gamesFilter.clearAll')}
        </Button>
      </div>
    </section>
  );
}

type RankRangeProps = {
  id: string;
  label: string;
  ranks: readonly string[];
  minimum?: string;
  maximum?: string;
  minimumLabel: string;
  maximumLabel: string;
  anyLabel: string;
  onChange: (minimum?: string, maximum?: string) => void;
};

function RankRange({
  id,
  label,
  ranks,
  minimum,
  maximum,
  minimumLabel,
  maximumLabel,
  anyLabel,
  onChange,
}: RankRangeProps) {
  const lastIndex = Math.max(0, ranks.length - 1);
  const minimumIndex = minimum ? ranks.indexOf(minimum) : 0;
  const maximumIndex = maximum ? ranks.indexOf(maximum) : lastIndex;

  return (
    <GameDualRange
      id={id}
      label={label}
      minimum={0}
      maximum={lastIndex}
      lowerValue={minimumIndex >= 0 ? minimumIndex : 0}
      upperValue={maximumIndex >= 0 ? maximumIndex : lastIndex}
      lowerLabel={`${label}: ${minimumLabel}`}
      upperLabel={`${label}: ${maximumLabel}`}
      formatValue={(index) => ranks[index] ?? anyLabel}
      disabled={ranks.length < 2}
      onCommit={(lowerIndex, upperIndex) =>
        onChange(
          lowerIndex === 0 ? undefined : ranks[lowerIndex],
          upperIndex === lastIndex ? undefined : ranks[upperIndex]
        )
      }
    />
  );
}

type MovesRangeProps = {
  id: string;
  label: string;
  minimum?: number;
  maximum?: number;
  domainMinimum?: number;
  domainMaximum?: number;
  minimumLabel: string;
  maximumLabel: string;
  onChange: (minimum?: number, maximum?: number) => void;
};

function MovesRange({
  id,
  label,
  minimum,
  maximum,
  domainMinimum = 0,
  domainMaximum = 0,
  minimumLabel,
  maximumLabel,
  onChange,
}: MovesRangeProps) {
  return (
    <GameDualRange
      id={id}
      label={label}
      minimum={domainMinimum}
      maximum={domainMaximum}
      lowerValue={minimum ?? domainMinimum}
      upperValue={maximum ?? domainMaximum}
      lowerLabel={`${label}: ${minimumLabel}`}
      upperLabel={`${label}: ${maximumLabel}`}
      disabled={domainMinimum >= domainMaximum}
      onCommit={(lowerValue, upperValue) =>
        onChange(
          lowerValue === domainMinimum ? undefined : lowerValue,
          upperValue === domainMaximum ? undefined : upperValue
        )
      }
    />
  );
}

function ToggleGroup<T extends string>({
  legend,
  values,
  selected,
  labels,
  onChange,
}: {
  legend: string;
  values: readonly T[];
  selected: readonly T[];
  labels: Record<T, string>;
  onChange: (selected: T[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-x-3 gap-y-2 rounded-sm border border-event-soft bg-white px-2 py-2">
        {values.map((value) => (
          <Toggle
            key={value}
            checked={selected.includes(value)}
            onChange={(checked) =>
              onChange(checked ? [...selected, value] : selected.filter((selectedValue) => selectedValue !== value))
            }
          >
            {labels[value]}
          </Toggle>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  className,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className={`flex flex-col min-w-0 ${className ?? ''}`}>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <select id={id} className={inputClassName} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type Translator = ReturnType<typeof getTranslator>;

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
  ].filter((option): option is { value: GameGroup; label: string } => Boolean(option));
}

function isGameWinner(value: string): value is GameWinner {
  return value === 'black' || value === 'white' || value === 'player' || value === 'opponent';
}
