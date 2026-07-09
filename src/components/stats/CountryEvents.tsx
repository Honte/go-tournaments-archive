'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { YearLink } from '@/components/YearLink';

type CountryEventsProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
};

type CountryEventRow = {
  year: number;
  categories?: string[];
  id: string;
  name: string;
  rank?: string;
  place: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
};

export function CountryEvents({ event, country, translations }: CountryEventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const list: CountryEventRow[] = [];

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        for (const stage of result.stages) {
          const games = stage.games.length;
          const won = stage.games.reduce((acc, game) => acc + Number(game.won), 0);

          list.push({
            year: Number(year),
            id: result.id,
            name: result.name,
            rank: result.rank,
            categories: stage.categories,
            place: stage.place,
            games,
            won,
            lost: games - won,
            wonPercent: won / games,
          });
        }
      }
    }

    return list.sort((a, b) => a.year - b.year);
  }, [country]);

  const columns = useMemo<ColumnDef<CountryEventRow>[]>(
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
          {
            accessorKey: 'lost',
            header: t('table.lost'),
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: toPercentage,
          },
        ] as ColumnDef<CountryEventRow>[]
      ).filter(Boolean),
    [translations, t, event]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
