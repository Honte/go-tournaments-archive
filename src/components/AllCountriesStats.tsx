'use client';

import type { StatsCountry, TableStats } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { sortTableStats } from '@/libs/sort';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';

type AllCountriesStatsProps = {
  countries: Record<string, StatsCountry>;
  translations: Translations;
};

type CountryRow = TableStats & {
  country: string;
  name: string;
  players: number;
};

export function AllCountriesStats({ countries, translations }: AllCountriesStatsProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(countries)
        .map<CountryRow>(({ country, medals, years, totalGames, totalWon, bestPlace }) => {
          const [gold, silver, bronze] = medals;

          const players = new Set<string>();
          for (const year in years) {
            for (const result of years[year].results) {
              players.add(result.id);
            }
          }

          return {
            country,
            name: t(`country.${country}`),
            bestPlace,
            players: players.size,
            attended: Object.keys(years).length,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            games: totalGames,
            won: totalWon,
            lost: totalGames - totalWon,
            wonPercent: totalWon / totalGames,
          };
        })
        .sort(sortTableStats),
    [countries, t]
  );

  const columns = useMemo<ColumnDef<CountryRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'country',
            header: t('table.code'),
          },
          {
            accessorKey: 'name',
            header: t('table.country'),
            cell: ({ row }) => (
              <CountryLink
                translations={translations}
                code={row.original.country}
                full={true}
                className="block text-left"
              />
            ),
          },
          {
            accessorKey: 'bestPlace',
            header: t('table.best'),
          },
          {
            accessorKey: 'attended',
            header: t('table.attended'),
          },
          {
            accessorKey: 'players',
            header: t('table.players'),
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
        ] as ColumnDef<CountryRow>[]
      ).filter(Boolean),
    [t, translations]
  );

  return <StatsTable columns={columns} data={data} />;
}
