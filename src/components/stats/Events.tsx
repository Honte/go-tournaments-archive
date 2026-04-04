'use client';

import type { Stage, StatsPlayer } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getStageNameFromType } from '@/libs/stage';
import { toPercentage } from '@/libs/table';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';

type EventsProps = {
  player: StatsPlayer;
  translations: Translations;
};

type EventRow = {
  year: number;
  stage: string;
  rank: string;
  place: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
};

export function Events({ player, translations }: EventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      player.results.toReversed().map((result) => {
        const {
          games: { length: games },
          won,
        } = result;

        return {
          ...result,
          games,
          lost: games - won,
          wonPercent: won / games,
        };
      }),
    [player]
  );

  const columns = useMemo<ColumnDef<EventRow>[]>(
    () =>
      [
        {
          accessorKey: 'year',
          header: t('table.year'),
          cell: (info) => <YearLink locale={translations.locale} year={info.cell.getValue() as number} />,
        },
        {
          accessorKey: 'stage',
          header: t('table.stage'),
          cell: (info) => getStageNameFromType(info.cell.getValue() as Stage['type'], translations),
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
      ] as ColumnDef<EventRow>[],
    [translations, t]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
