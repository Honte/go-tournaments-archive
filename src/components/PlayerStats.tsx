'use client';

import EVENT_CONFIG from '@event/config';
import type { StatsPlayer } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { toPercentage } from '@/libs/table';
import { Country } from '@/components/Country';
import { StatsTable } from '@/components/table/StatsTable';
import { PlayerCell } from '@/components/ui/PlayerCell';

type PlayerStatsProps = {
  players: Record<string, StatsPlayer>;
  translations: Translations;
};

type PlayerRow = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  countries: Set<string>;
  bestPlace: number;
  gold: number;
  silver: number;
  bronze: number;
  attended: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
  score: number;
};

export function PlayerStats({ players, translations }: PlayerStatsProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(players)
        .filter((p) => p.id !== 'BYE')
        .map((p) => {
          const { id, name, medals, years, score, totalGames, totalWon, bestPlace, countries } = p;
          const [firstName, lastName] = (name ?? '').split(' ');
          const [gold, silver, bronze] = medals;

          return {
            id,
            name: name ?? '',
            firstName,
            lastName,
            countries,
            bestPlace,
            score,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            attended: years.length,
            games: totalGames,
            won: totalWon,
            lost: totalGames - totalWon,
            wonPercent: totalWon / totalGames,
          } as PlayerRow;
        })
        .sort(sortPlayers),
    [players]
  );

  const columns = useMemo<ColumnDef<PlayerRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'firstName',
            header: t('table.firstName'),
            cell: (info) => (
              <PlayerCell
                player={info.row.original}
                locale={translations.locale}
                includeRank={false}
                includeCountry={false}
              />
            ),
            meta: { span: 2 },
          },
          {
            accessorKey: 'lastName',
            header: t('table.lastName'),
            meta: { skip: true },
          },
          EVENT_CONFIG.showCountry && {
            accessorKey: 'country',
            header: t('table.country'),
            cell: (info) =>
              jsxJoin(
                Array.from(info.row.original.countries).map((code) => (
                  <Country key={code} translations={translations} code={code} />
                )),
                ', '
              ),
          },
          {
            accessorKey: 'bestPlace',
            header: t('table.best'),
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
        ] as ColumnDef<PlayerRow>[]
      ).filter(Boolean),
    [t, translations]
  );

  return <StatsTable columns={columns} data={data} />;
}

function sortPlayers(a: PlayerRow, b: PlayerRow) {
  if (a.score === b.score) {
    if (a.bestPlace === b.bestPlace) {
      if (a.attended === b.attended) {
        if (a.won === b.won) {
          return b.games - a.games;
        }

        return b.won - a.won;
      }

      return b.attended - a.attended;
    }

    return a.bestPlace - b.bestPlace;
  }

  return b.score - a.score;
}
