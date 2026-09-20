'use client';

import { useMemo } from 'react';
import type { PlayerStats, Stage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getGameStats } from '@/libs/games';
import { getPlayerAvailableCategories } from '@/libs/playerStats';
import { getStageName } from '@/libs/stage';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
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
  categories?: Record<string, number | '?'>;
  stage: Pick<Stage, 'name' | 'type'>;
  name: string;
  rank?: string;
  place: number;
  games: number;
  sgfs: number;
  country?: string;
  won: number;
  drawn: number;
  unresolved: number;
  lost: number;
  wonPercent: number;
};

export function PlayerEvents({ event, player, translations }: PlayerEventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const results: EventRow[] = [];

    for (const event of player.results) {
      for (const stage of event.stages) {
        const outcomes = getGameStats(stage.games);

        results.push({
          year: event.year,
          name: event.name,
          categories: stage.categories,
          sgfs: new Set(stage.games.map((game) => game.props?.sgf).filter(Boolean)).size,
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
  }, [player]);

  const hasMultipleNames = data.some((row) => row.name !== player.name);
  const hasMultipleCountries = new Set(data.map((row) => row.country)).size > 1;
  const hasMultipleStages = new Set(data.map((row) => getStageName(row.stage, translations))).size > 1;
  const hasDraws = data.some((row) => row.drawn > 0);
  const hasUnresolved = data.some((row) => row.unresolved > 0);
  const hasSgfs = data.some((row) => row.sgfs > 0);

  const columns = useMemo<StatsColumnDef<EventRow>[]>(
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
          hasMultipleStages && {
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
          ...getPlayerAvailableCategories(player, event.categories ?? []).map<StatsColumnDef<EventRow>>((category) => ({
            id: `category-${category}`,
            accessorFn: (row) => row.categories?.[category],
            header: t(`categories.short.${category}`),
            cell: (info) =>
              info.row.original.categories?.[category] ?? <span className="text-archive-text-muted/50">–</span>,
          })),
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
          hasUnresolved && {
            accessorKey: 'unresolved',
            header: t('table.unresolved'),
          },
          hasSgfs && {
            accessorKey: 'sgfs',
            header: t('table.sgfs'),
            cell: ({ row }) => {
              const categories = Object.keys(row.original.categories ?? {});
              return (
                <SgfCountLink
                  event={event}
                  locale={translations.locale}
                  count={row.original.sgfs}
                  filters={{
                    player: player.id,
                    country: row.original.country,
                    years: [row.original.year],
                    category: categories.length === 1 ? categories[0] : undefined,
                  }}
                />
              );
            },
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: getFormatter(translations.locale).toPercentageCell,
          },
        ] as StatsColumnDef<EventRow>[]
      ).filter(Boolean),
    [
      translations,
      hasMultipleNames,
      hasMultipleCountries,
      hasMultipleStages,
      hasDraws,
      hasUnresolved,
      hasSgfs,
      player,
      event,
      t,
    ]
  );

  return (
    <div>
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
