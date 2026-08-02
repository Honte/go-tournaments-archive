'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { PlayerStats, Stage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getGameStats } from '@/libs/games';
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
  showCategories?: boolean;
};

type EventRow = {
  year: number;
  categories?: Record<string, number | '?'>;
  stage: Pick<Stage, 'name' | 'type'>;
  name: string;
  rank?: string;
  place: number;
  games: number;
  country?: string;
  won: number;
  drawn: number;
  lost: number;
  wonPercent: number;
};

export function PlayerEvents({
  event,
  player,
  translations,
  showCategories = Boolean(event.categories?.length),
}: PlayerEventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const results: EventRow[] = [];

    for (const event of player.results) {
      for (const stage of event.stages) {
        const outcomes = getGameStats(stage.games);

        results.push({
          year: event.year,
          name: event.name,
          categories: showCategories && stage.categories ? stage.categories : undefined,
          stage: {
            name: stage.name,
            type: stage.type,
          },
          ...outcomes,
          country: event.country,
          place: stage.place,
          rank: event.rank,
        });
      }
    }

    return results.sort((a, b) => b.year - a.year);
  }, [player, showCategories]);

  const hasMultipleNames = new Set(data.map((row) => row.name)).size > 1;
  const hasMultipleCountries = new Set(data.map((row) => row.country)).size > 1;
  const hasDraws = data.some((row) => row.drawn > 0);

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
          showCategories &&
            event.categories?.length && {
              accessorKey: 'categories',
              header: t('table.category'),
              cell: (info) => formatCategories(info.row.original.categories, t),
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
          hasDraws && {
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
            cell: toPercentage,
          },
        ] as ColumnDef<EventRow>[]
      ).filter(Boolean),
    [translations, hasMultipleNames, hasMultipleCountries, hasDraws, event, t, showCategories]
  );

  return (
    <div>
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}

function formatCategories(categories: Record<string, number | '?'> | undefined, t: (key: string) => string) {
  const keys = Object.keys(categories ?? {});

  return keys.length ? keys.map((category) => t(`categories.short.${category}`)).join(', ') : '-';
}
