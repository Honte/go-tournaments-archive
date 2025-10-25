'use client';

import { useMemo } from 'react';
import { StatsTable } from '@/components/table/StatsTable';
import { toPercentage, toPlayerLink } from '@/libs/table';
import { getTranslator } from '@/i18n/translator';

export function PlayerStats({ players, translations }) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(players)
        .filter((p) => p.id !== 'BYE')
        .map((p) => {
          const { id, name, medals, years, score, games, totalGames, totalWon } = p;
          const [firstName, lastName] = name.split(' ');
          const [gold, silver, bronze] = medals;

          const finalScore = score * 10000 + totalWon * 100 + totalGames;

          return {
            id,
            name,
            firstName,
            lastName,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            attended: years.length,
            games: totalGames,
            won: totalWon,
            lost: totalGames - totalWon,
            wonPercent: totalWon / totalGames,
            finalScore,
          };
        })
        .sort((a, b) => b.finalScore - a.finalScore),
    [players]
  );

  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'firstName',
        header: t('table.firstName'),
        cell: (info) => toPlayerLink(info, translations),
        span: 2,
      },
      {
        accessorKey: 'lastName',
        header: t('table.lastName'),
        skip: true,
        // cell: (info) => toPlayerLink(info, translations)
      },
      {
        accessorKey: 'gold',
        header: t('medals.gold'),
      },
      {
        accessorKey: 'silver',
        header: t('medals.silver'),
      },
      {
        accessorKey: 'bronze',
        header: t('medals.bronze'),
      },
      {
        accessorKey: 'attended',
        header: t('table.events'),
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
    ];
  }, [t, translations]);

  return <StatsTable columns={columns} data={data} />;
}
