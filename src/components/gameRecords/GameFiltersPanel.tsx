'use client';

import { useStore } from 'zustand';
import {
  CategoryFacet,
  CountryFacet,
  GroupFacet,
  KomiFacet,
  MediaFacet,
  MovesFacet,
  OpponentCountryFacet,
  OpponentFacet,
  OpponentRankFacet,
  PlayerColorFacet,
  PlayerFacet,
  PlayerRankFacet,
  ResultFacet,
  SortFacet,
  WinnerFacet,
  YearFacet,
} from '@/components/gameRecords/facets';
import type { GameFacetProps } from '@/components/gameRecords/facets/types';
import { GameBrowserToolbar } from '@/components/gameRecords/GameBrowserToolbar';

const columnClassName = 'min-w-0 space-y-4';
const FILTER_PANEL_ID = 'game-record-filters';
const ADVANCED_FILTERS_ID = `${FILTER_PANEL_ID}-advanced`;

export function GameFiltersPanel({ store, t }: GameFacetProps) {
  const expanded = useStore(store, (storeState) => storeState.expanded);

  return (
    <section id={FILTER_PANEL_ID} className="rounded-md border border-event-soft bg-white p-3 shadow-sm md:p-4">
      {!expanded && (
        <div className="flex flex-col sm:grid sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <PlayerFacet store={store} t={t} />
          <SortFacet store={store} t={t} />
          <GroupFacet store={store} t={t} />
          <GameBrowserToolbar store={store} t={t} className="sm:col-span-3 xl:col-span-1" />
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

              <PlayerFacet store={store} t={t} />
              <CountryFacet store={store} t={t} />
              <PlayerRankFacet store={store} t={t} />
              <PlayerColorFacet store={store} t={t} />
            </section>

            <section aria-labelledby={`${FILTER_PANEL_ID}-opponent-heading`} className={columnClassName}>
              <h2
                id={`${FILTER_PANEL_ID}-opponent-heading`}
                className="border-b border-event-soft pb-2 text-base font-bold"
              >
                {t('gamesFilter.opponentFilters')}
              </h2>

              <OpponentFacet store={store} t={t} />
              <OpponentCountryFacet store={store} t={t} />
              <OpponentRankFacet store={store} t={t} />
            </section>

            <section aria-labelledby={`${FILTER_PANEL_ID}-game-heading`} className={columnClassName}>
              <h2
                id={`${FILTER_PANEL_ID}-game-heading`}
                className="border-b border-event-soft pb-2 text-base font-bold"
              >
                {t('gamesFilter.gameFilters')}
              </h2>

              <YearFacet store={store} t={t} />
              <CategoryFacet store={store} t={t} />
              <MovesFacet store={store} t={t} />
              <WinnerFacet store={store} t={t} />
              <ResultFacet store={store} t={t} />
              <KomiFacet store={store} t={t} />
              <MediaFacet store={store} t={t} />
            </section>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-4 flex max-sm:flex-col flex-wrap gap-4 border-t border-event-soft pt-4">
          <SortFacet store={store} t={t} />
          <GroupFacet store={store} t={t} />
          <GameBrowserToolbar store={store} t={t} />
        </div>
      )}
    </section>
  );
}
