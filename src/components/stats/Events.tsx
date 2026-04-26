'use client';

import EVENT_CONFIG from '@event/config';
import type { ApiPlayerStats } from '@/schema/api';
import type { Stage } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getStageNameFromType } from '@/libs/stage';
import { toPercentage } from '@/libs/table';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';

type EventsProps = {
  player: ApiPlayerStats;
  translations: Translations;
};

type EventRow = {
  year: number;
  stage: Stage['type'];
  rank: string;
  place: number;
  games: number;
  country?: string;
  won: number;
  lost: number;
  wonPercent: number;
};

export function Events({ player, translations }: EventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const results: EventRow[] = [];

    for (const event of player.results) {
      for (const stage of event.stages) {
        const games = stage.games.length;
        const won = stage.games.reduce((acc, game) => acc + (game.won ? 1 : 0), 0);

        results.push({
          year: event.year,
          stage: stage.type,
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

  const columns = useMemo<ColumnDef<EventRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => <YearLink locale={translations.locale} year={info.cell.getValue() as number} />,
          },
          {
            accessorKey: 'stage',
            header: t('table.stage'),
            cell: (info) => getStageNameFromType(info.row.original.stage, translations),
          },
          EVENT_CONFIG.showCountry && {
            accessorKey: 'country',
            header: t('table.country'),
            cell: (info) => <CountryLink code={info.row.original.country} translations={translations} />,
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
        ] as ColumnDef<EventRow>[]
      ).filter(Boolean),
    [translations, t]
  );

  return (
    <div>
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
