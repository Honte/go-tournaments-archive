'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import type { GameRecordsOptions } from '@/libs/gameRecords';
import { GameFiltersPanel } from '@/components/gameRecords/GameFiltersPanel';
import { useGameRecordsStore } from '@/components/gameRecords/useGameRecordsStore';
import { type GameRecordGroup, VirtualGameRecordGrid } from '@/components/gameRecords/VirtualGameRecordGrid';
import { Button } from '@/components/ui/Button';
import { H1 } from '@/components/ui/H1';
import { Loader } from '@/components/ui/Loader';
import { useGamesData } from '@/hooks/useGamesData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type AllGamesProps = {
  event: EventContext;
  locale: Locale;
};

type AllGamesContentProps = {
  event: EventContext;
  games: ApiGameInfo[];
  translations: Translations;
};

export function AllGames({ event, locale }: AllGamesProps) {
  const translationsData = useTranslationsData(event, locale);
  const gamesData = useGamesData(event);

  if (translationsData.isPending || gamesData.isPending) {
    return <Loader />;
  }

  if (!translationsData.data || !gamesData.data) {
    return <p>No data</p>;
  }

  return <AllGamesContent event={event} games={gamesData.data} translations={translationsData.data} />;
}

function AllGamesContent({ event, games, translations }: AllGamesContentProps) {
  const t = getTranslator(translations);

  const modelOptions = useMemo<GameRecordsOptions>(
    () => ({
      countriesEnabled: event.showCountry,
      categoriesEnabled: Boolean(event.categories?.length),
      countryLabel: (country) => t(`country.${country}`),
      categoryLabel: (category) => t(`categories.short.${category}`),
      unknownCountryLabel: t('gamesFilter.unknown'),
    }),
    [event.categories, event.showCountry, t]
  );

  const store = useGameRecordsStore(games, modelOptions);
  const model = useStore(store, (state) => state.model);
  const clearAll = useStore(store, (state) => state.clearFilters);

  const titleCount =
    model.filteredCount === model.totalCount
      ? String(model.totalCount)
      : t('gamesFilter.count', String(model.filteredCount), String(model.totalCount));

  const groups = useMemo<GameRecordGroup[]>(
    () =>
      model.groups.map((group) => ({
        ...group,
        label: group.label ? `${group.label} (${group.games.length})` : undefined,
      })),
    [model.groups]
  );

  return (
    <>
      <H1>
        {t('site.gamesListTitle')} ({titleCount})
      </H1>

      <GameFiltersPanel store={store} t={t} />

      {model.filteredCount > 0 ? (
        <VirtualGameRecordGrid key={model.state.group} event={event} groups={groups} translations={translations} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <p>{t('gamesFilter.noMatches')}</p>
          <Button type="button" onClick={clearAll}>
            {t('gamesFilter.clearAll')}
          </Button>
        </div>
      )}
    </>
  );
}
