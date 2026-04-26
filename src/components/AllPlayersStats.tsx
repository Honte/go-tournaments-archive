'use client';

import EVENT_CONFIG from '@event/config';
import { useTranslationsData } from '@/hooks/useTranslationsData';
import type { StatsPlayer, TableStats } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { sortTableStats } from '@/libs/sort';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { Loader } from '@/components/ui/Loader';
import { PlayerCell } from '@/components/ui/PlayerCell';

type AllPlayersStatsProps = {
  players: Record<string, StatsPlayer>;
  locale: Locale;
};

type AllPlayersStatsContentProps = {
  players: Record<string, StatsPlayer>;
  translations: Translations;
};

type PlayerRow = TableStats & {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  countries: string[];
};

export function AllPlayersStats({ players, locale }: AllPlayersStatsProps) {
  const { data: translations } = useTranslationsData(locale);

  if (!translations) {
    return <Loader />;
  }

  return <AllPlayersStatsContent players={players} translations={translations} />;
}

function AllPlayersStatsContent({ players, translations }: AllPlayersStatsContentProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(players)
        .filter((p) => p.id !== 'BYE')
        .map<PlayerRow>((p) => {
          const { id, name, medals, years, totalGames, totalWon, bestPlace, countries } = p;
          const [firstName, lastName] = (name ?? '').split(' ');
          const [gold, silver, bronze] = medals;

          return {
            id,
            name: name ?? '',
            firstName,
            lastName,
            countries,
            bestPlace,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            attended: years.length,
            games: totalGames,
            won: totalWon,
            lost: totalGames - totalWon,
            wonPercent: totalWon / totalGames,
          };
        })
        .sort(sortTableStats),
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
                info.row.original.countries.map((code) => (
                  <CountryLink key={code} translations={translations} code={code} />
                )),
                ', '
              ),
          },
          EVENT_CONFIG.showBestPlace && {
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
