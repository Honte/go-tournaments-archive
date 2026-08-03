'use client';

import { useCallback, useMemo } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { DEFAULT_GAME_BROWSER_STATE, type GameBrowserOptions } from '@/libs/gameRecords';
import { GameFiltersPanel } from '@/components/gameRecords/GameFiltersPanel';
import { useGameBrowserUrlState } from '@/components/gameRecords/useGameBrowserUrlState';
import { VirtualGameRecordGrid, type GameRecordGroup } from '@/components/gameRecords/VirtualGameRecordGrid';
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

  const modelOptions = useMemo<GameBrowserOptions>(() => {
    const translate = getTranslator(translations);
    return {
      countriesEnabled: event.showCountry,
      categoriesEnabled: Boolean(event.categories?.length),
      countryLabel: (country) => translate(`country.${country}`),
      categoryLabel: (category) => translate(`categories.short.${category}`),
      unknownCountryLabel: translate('gamesFilter.unknown'),
      locale: translations.locale,
    };
  }, [event.categories, event.showCountry, translations]);

  const { commitState, model } = useGameBrowserUrlState(games, modelOptions);

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

  const clearAll = useCallback(
    () =>
      commitState({
        ...DEFAULT_GAME_BROWSER_STATE,
        results: [],
        media: [],
      }),
    [commitState]
  );

  return (
    <>
      <H1>
        {t('site.gamesListTitle')} ({titleCount})
      </H1>

      <GameFiltersPanel model={model} translations={translations} onChange={commitState} onClear={clearAll} />

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
