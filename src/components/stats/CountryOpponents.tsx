'use client';

import type { StatsCountry } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';

type CountryOpponentsProps = {
  country: StatsCountry;
  translations: Translations;
};

type CountryOpponentRow = {
  code: string;
  name: string;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
};

export function CountryOpponents({ country, translations }: CountryOpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const countries: Record<string, CountryOpponentRow> = {};

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        for (const game of result.games) {
          if (!game.opponentCountry) {
            continue;
          }

          const target = (countries[game.opponentCountry] ||= {
            code: game.opponentCountry,
            name: t(`country.${game.opponentCountry}`),
            games: 0,
            won: 0,
            lost: 0,
            wonPercent: 0,
          });

          target.games++;
          target.won += Number(game.won);
        }
      }
    }

    const list = Object.values(countries);

    for (const player of list) {
      player.lost = player.games - player.won;
      player.wonPercent = player.won / player.games;
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [country.years, t]);

  const columns = useMemo<ColumnDef<CountryOpponentRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'name',
            header: t('table.country'),
            cell: (info) => (
              <CountryLink
                code={info.row.original.code}
                translations={translations}
                className="block text-left"
                full={true}
              />
            ),
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
        ] as ColumnDef<CountryOpponentRow>[]
      ).filter(Boolean),
    [translations, t]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
