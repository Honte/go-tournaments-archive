'use client';

import type { StatsPlayer } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage, toPlayerLink } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';

type PlayerStatsProps = {
  players: Record<string, StatsPlayer>;
  translations: Translations;
};

type PlayerRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  gold: number;
  silver: number;
  bronze: number;
  attended: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
  finalScore: number;
};

export function PlayerStats({ players, translations }: PlayerStatsProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(players)
        .filter((p) => p.id !== 'BYE')
        .map((p) => {
          const { id, name, medals, years, score, totalGames, totalWon } = p;
          const [firstName, lastName] = (name ?? '').split(' ');
          const [gold, silver, bronze] = medals;

          const finalScore = score * 10000 + totalWon * 100 + totalGames;

          return {
            id,
            name: name ?? '',
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
          } as PlayerRow;
        })
        .sort((a, b) => b.finalScore - a.finalScore),
    [players]
  );

  const columns = useMemo<ColumnDef<PlayerRow>[]>(() => {
    return [
      {
        accessorKey: 'firstName',
        header: t('table.firstName'),
        cell: (info) => toPlayerLink(info, translations),
        meta: { span: 2 },
      },
      {
        accessorKey: 'lastName',
        header: t('table.lastName'),
        meta: { skip: true },
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
    ] as ColumnDef<PlayerRow>[];
  }, [t, translations]);

  return <StatsTable columns={columns} data={data} />;
}
