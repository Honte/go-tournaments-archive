'use client';

import type { StatsCountry } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';

type CountryEventsProps = {
  country: StatsCountry;
  translations: Translations;
};

type CountryEventRow = {
  year: number;
  id: string;
  name: string;
  rank: string;
  place: number;
  games: number;
  won: number;
  lost: number;
  wonPercent: number;
};

export function CountryEvents({ country, translations }: CountryEventsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const list: CountryEventRow[] = [];

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        const games = result.games.length;

        list.push({
          year: Number(year),
          id: result.id,
          name: result.name,
          rank: result.rank,
          place: result.place,
          games,
          won: result.won,
          lost: games - result.won,
          wonPercent: result.won / games,
        });
      }
    }

    return list.sort((a, b) => a.year - b.year);
  }, [country]);

  const columns = useMemo<ColumnDef<CountryEventRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => <YearLink locale={translations.locale} year={info.cell.getValue() as number} />,
          },
          {
            accessorKey: 'name',
            header: t('table.player'),
            cell: (info) => (
              <PlayerLink playerId={info.row.original.id} locale={translations.locale} className="block text-left">
                {info.row.original.name}
              </PlayerLink>
            ),
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
        ] as ColumnDef<CountryEventRow>[]
      ).filter(Boolean),
    [translations, t]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.events')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
