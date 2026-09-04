'use client';

import { useMemo, useState } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getGameStats } from '@/libs/games';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { Toggle } from '@/components/ui/Toggle';
import { YearLink } from '@/components/YearLink';

type CountryEventsProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
  showCategories?: boolean;
};

type CountryEventRow = {
  year: number;
  categories?: string[];
  id: string;
  name: string;
  rank?: string;
  place: number | '?';
  games: number;
  won: number;
  drawn: number;
  lost: number;
  wonPercent: number;
};

type CountryEventRowsOptions = {
  country: CountryStats;
  showBestOnly: boolean;
  hasCategories: boolean;
  showCategories: boolean;
};

export function CountryEvents({
  event,
  country,
  translations,
  showCategories = Boolean(event.categories?.length),
}: CountryEventsProps) {
  const [showBestOnly, setShowBestOnly] = useState(true);
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      getCountryEventRows({
        country,
        showBestOnly,
        hasCategories: Boolean(event.categories?.length),
        showCategories,
      }),
    [country, event.categories?.length, showBestOnly, showCategories]
  );

  const columns = useMemo<StatsColumnDef<CountryEventRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => (
              <YearLink event={event} locale={translations.locale} year={info.cell.getValue() as number} />
            ),
          },
          showCategories &&
            event.categories?.length && {
              accessorKey: 'categories',
              header: t('table.category'),
              cell: (info) =>
                info.row.original.categories?.length
                  ? info.row.original.categories.map((category) => t(`categories.short.${category}`)).join(', ')
                  : '-',
            },
          {
            accessorKey: 'name',
            header: t('table.player'),
            cell: (info) => (
              <PlayerLink
                event={event}
                playerId={info.row.original.id}
                locale={translations.locale}
                className="block text-left"
              >
                {info.row.original.name}
              </PlayerLink>
            ),
          },
          {
            accessorKey: 'rank',
            header: t('table.rank'),
          },
          {
            accessorKey: 'place',
            header: t('table.place'),
          },
          {
            accessorKey: 'games',
            header: t('table.games'),
          },
          {
            accessorKey: 'won',
            header: t('table.won'),
          },
          data.some((row) => row.drawn > 0) && {
            accessorKey: 'drawn',
            header: t('table.drawn'),
          },
          {
            accessorKey: 'lost',
            header: t('table.lost'),
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: getFormatter(translations.locale).toPercentageCell,
          },
        ] as StatsColumnDef<CountryEventRow>[]
      ).filter(Boolean),
    [translations, t, event, showCategories, data]
  );

  return (
    <div className="my-2 flex-1">
      <H2
        actions={
          <Toggle checked={showBestOnly} onChange={setShowBestOnly}>
            {t('stats.bestParticipantsOnly')}
          </Toggle>
        }
      >
        {t('stats.events')}
      </H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}

export function getCountryEventRows({ country, showBestOnly, hasCategories, showCategories }: CountryEventRowsOptions) {
  const list: CountryEventRow[] = [];

  for (const year in country.years) {
    const yearData = country.years[year];
    const bestCategoryPlaces: Record<string, number> = {};
    const bestPlace = yearData.results[0]?.place;

    if (showBestOnly && hasCategories) {
      for (const result of yearData.results) {
        for (const stage of result.stages) {
          for (const [category, place] of Object.entries(stage.categories ?? {})) {
            if (typeof place === 'number') {
              bestCategoryPlaces[category] = Math.min(bestCategoryPlaces[category] ?? Infinity, place);
            }
          }
        }
      }
    }

    for (const result of yearData.results) {
      if (showBestOnly && !hasCategories && result.place !== bestPlace) {
        break;
      }

      for (const stage of result.stages) {
        if (
          showBestOnly &&
          hasCategories &&
          !Object.entries(stage.categories ?? {}).some(
            ([category, place]) => typeof place === 'number' && place === bestCategoryPlaces[category]
          )
        ) {
          continue;
        }

        const outcomes = getGameStats(stage.games);

        list.push({
          year: Number(year),
          id: result.id,
          name: result.name,
          rank: result.rank,
          categories: showCategories && stage.categories ? Object.keys(stage.categories) : undefined,
          place: stage.place,
          ...outcomes,
        });
      }
    }
  }

  return list.sort((a, b) => a.year - b.year);
}
