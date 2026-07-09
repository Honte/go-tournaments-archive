'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { PlayerStats, Stage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getStageName } from '@/libs/stage';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';
import { YearLink } from '@/components/YearLink';

type PlayerEventsProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
};

type EventRow = {
  year: number;
  categories?: string[];
  stage: Pick<Stage, 'name' | 'type'>;
  name: string;
  rank?: string;
  place: number;
  games: number;
  country?: string;
  won: number;
  lost: number;
  wonPercent: number;
};

export function PlayerEvents({ event, player, translations }: PlayerEventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const results: EventRow[] = [];

    for (const event of player.results) {
      for (const stage of event.stages) {
        const games = stage.games.length;
        const won = stage.games.reduce((acc, game) => acc + (game.won ? 1 : 0), 0);

        results.push({
          year: event.year,
          name: event.name,
          categories: stage.categories,
          stage: {
            name: stage.name,
            type: stage.type,
          },
          won,
          games,
          lost: games - won,
          wonPercent: won / games,
          country: event.country,
          place: stage.place,
          rank: event.rank,
        });
      }
    }

    return results.sort((a, b) => b.year - a.year);
  }, [player]);

  const hasMultipleNames = new Set(data.map((row) => row.name)).size > 1;
  const hasMultipleCountries = new Set(data.map((row) => row.country)).size > 1;

  const columns = useMemo<ColumnDef<EventRow>[]>(
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
            accessorKey: 'stage',
            header: t('table.stage'),
            cell: (info) => getStageName(info.row.original.stage, translations),
          },
          hasMultipleNames && {
            accessorKey: 'name',
            header: t('table.name'),
          },
          {
            accessorKey: 'rank',
            header: t('table.rank'),
          },
          event.showCountry &&
            hasMultipleCountries && {
              accessorKey: 'country',
              header: t('table.country'),
              cell: (info) => (
                <CountryLink event={event} code={info.row.original.country} translations={translations} />
              ),
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
        ] as ColumnDef<EventRow>[]
      ).filter(Boolean),
    [translations, hasMultipleNames, hasMultipleCountries, event, t]
  );

  return (
    <div>
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
