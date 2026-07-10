'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  DEFAULT_GAME_BROWSER_STATE,
  deriveGameBrowserModel,
  getActiveGameFilterCount,
  parseGameBrowserState,
  serializeGameBrowserState,
  type GameBrowserOptions,
  type GameBrowserState,
} from '@/components/stats/allGamesModel';
import { GameFiltersPanel } from '@/components/stats/GameFiltersPanel';
import { VirtualGameRecordGrid, type GameRecordGroup } from '@/components/stats/VirtualGameRecordGrid';
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

const FILTER_PANEL_ID = 'game-record-filters';

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
  const searchParams = useSearchParams();
  const t = getTranslator(translations);
  const requestedState = useMemo(() => parseGameBrowserState(searchParams), [searchParams]);
  const modelOptions = useMemo<GameBrowserOptions>(() => {
    const translate = getTranslator(translations);
    return {
      countriesEnabled: event.showCountry,
      countryLabel: (country) => translate(`country.${country}`),
      unknownCountryLabel: translate('gamesFilter.other'),
      locale: translations.locale,
    };
  }, [event.showCountry, translations]);
  const model = useMemo(
    () => deriveGameBrowserModel(games, requestedState, modelOptions),
    [games, modelOptions, requestedState]
  );
  const activeCount = getActiveGameFilterCount(model.state);
  const [filtersOpen, setFiltersOpen] = useState(() => activeCount > 0);
  const groups = useMemo<GameRecordGroup[]>(
    () =>
      model.groups.map((group) => ({
        ...group,
        label: group.label ? `${t('gamesFilter.versus', group.label)} (${group.games.length})` : undefined,
      })),
    [model.groups, t]
  );

  useEffect(() => {
    const current = new URLSearchParams(searchParams.toString());
    const canonical = serializeGameBrowserState(model.state, current);

    if (canonical.toString() !== current.toString()) {
      updateBrowserUrl(canonical, 'replace');
    }
  }, [model.state, searchParams]);

  const commitState = useCallback(
    (requested: GameBrowserState) => {
      const normalized = deriveGameBrowserModel(games, requested, modelOptions).state;
      const current = new URLSearchParams(window.location.search);
      const next = serializeGameBrowserState(normalized, current);

      if (next.toString() !== current.toString()) {
        const scrollTop = window.scrollY;
        updateBrowserUrl(next, 'push');
        preserveWindowScroll(scrollTop);
      }
    },
    [games, modelOptions]
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
      <H1
        actions={
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1 text-sm underline underline-offset-2 hover:text-event-hover focus-visible:ring-2 focus-visible:ring-event-primary"
            aria-controls={FILTER_PANEL_ID}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <FaChevronRight
              aria-hidden={true}
              className={`transition-transform duration-200 ${filtersOpen ? 'rotate-90' : ''}`}
            />
            {t('gamesFilter.filter')}
            {activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        }
      >
        {t('site.gamesListTitle')} ({t('gamesFilter.count', String(model.filteredCount), String(model.totalCount))})
      </H1>

      {filtersOpen && (
        <GameFiltersPanel
          id={FILTER_PANEL_ID}
          model={model}
          translations={translations}
          onChange={commitState}
          onClear={clearAll}
        />
      )}

      {model.filteredCount > 0 ? (
        <VirtualGameRecordGrid event={event} groups={groups} translations={translations} />
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

function updateBrowserUrl(params: URLSearchParams, method: 'push' | 'replace') {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;

  if (method === 'push') {
    window.history.pushState(null, '', url);
  } else {
    window.history.replaceState(null, '', url);
  }
}

function preserveWindowScroll(scrollTop: number) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo(0, scrollTop));
  });
}
