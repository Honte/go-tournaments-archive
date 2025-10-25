'use client';

import { getTranslator } from '@/i18n/translator';
import { H2 } from '@/components/ui/H2';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { getStageNameFromType } from '@/libs/stage';
import { toPercentage } from '@/libs/table';
import { useMemo } from 'react';


export function Events({ player, translations }) {
  const t = getTranslator(translations);

  const data = useMemo(() => player.results.toReversed().map((result, index) => {
    const { games: { length: games }, won } = result;

    return ({
      ...result,
      games,
      lost: games - won,
      wonPercent: won / games
    });
  }), [player]);

  const columns = useMemo(() => [
    {
      accessorKey: 'year',
      header: t('table.year'),
      cell: (info) => <YearLink locale={translations.locale} year={info.cell.getValue()}/>
    },
    {
      accessorKey: 'stage',
      header: t('table.stage'),
      cell: (info) => getStageNameFromType(info.cell.getValue(), translations)
    },
    {
      accessorKey: 'rank',
      header: t('table.rank')
    },
    {
      accessorKey: 'place',
      header: t('table.place')
    },
    {
      accessorKey: 'games',
      header: t('table.games')
    },
    {
      accessorKey: 'won',
      header: t('table.won')
    },
    {
      accessorKey: 'lost',
      header: t('table.lost')
    },
    {
      accessorKey: 'wonPercent',
      header: t('table.wonPercent'),
      cell: toPercentage
    }
  ], [translations, t]);

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns}/>
    </div>
  );
}
