'use client';

import { useMemo } from 'react';
import type { CountryStats, TableStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { sortTableStats } from '@/libs/sort';
import { toNumeric, toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { CountryLink } from '@/components/ui/CountryLink';
import { Loader } from '@/components/ui/Loader';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type AllCountriesStatsProps = {
  event: EventContext;
  countries: Record<string, CountryStats>;
  locale: Locale;
};

type AllCountriesStatsContentProps = {
  event: EventContext;
  countries: Record<string, CountryStats>;
  translations: Translations;
};

type CountryRow = TableStats & {
  country: string;
  name: string;
  players: number;
};

export function AllCountriesStats({ event, countries, locale }: AllCountriesStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);

  if (!translations) {
    return <Loader />;
  }

  return <AllCountriesStatsContent event={event} countries={countries} translations={translations} />;
}

function AllCountriesStatsContent({ event, countries, translations }: AllCountriesStatsContentProps) {
  const t = getTranslator(translations);

  const data = useMemo(
    () =>
      Object.values(countries)
        .map<CountryRow>(({ code, medals, years, totalGames, totalWon, totalDrawn, bestPlace }) => {
          const [gold, silver, bronze] = medals;

          const players = new Set<string>();
          for (const year in years) {
            for (const result of years[year].results) {
              players.add(result.id);
            }
          }

          return {
            country: code,
            name: t(`country.${code}`),
            bestPlace,
            players: players.size,
            attended: Object.keys(years).length,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            games: totalGames,
            won: totalWon,
            drawn: totalDrawn,
            lost: totalGames - totalWon - totalDrawn,
            wonPercent: totalWon / totalGames,
          };
        })
        .sort(sortTableStats),
    [countries, t]
  );
  const hasDraws = data.some((country) => country.drawn > 0);

  const columns = useMemo<StatsColumnDef<CountryRow>[]>(
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
                event={event}
                translations={translations}
                code={row.original.country}
                full={true}
                className="block text-left"
              />
            ),
          },
          event.showBestPlace && {
            accessorKey: 'bestPlace',
            header: t('table.best'),
            cell: toNumeric,
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
        ] as StatsColumnDef<CountryRow>[]
      ).filter(Boolean),
    [t, translations, event, hasDraws]
  );

  return <StatsTable columns={columns} data={data} />;
}
