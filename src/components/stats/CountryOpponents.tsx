'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';

type CountryOpponentsProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
};

type CountryOpponentRow = {
  code: string;
  name: string;
  games: number;
  won: number;
  drawn: number;
  lost: number;
  wonPercent: number;
};

export function CountryOpponents({ event, country, translations }: CountryOpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const countries: Record<string, CountryOpponentRow> = {};

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        for (const stage of result.stages) {
          for (const game of stage.games) {
            if (!game.country || game.country === country.code) {
              continue;
            }

            const target = (countries[game.country] ||= {
              code: game.country,
              name: t(`country.${game.country}`),
              games: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              wonPercent: 0,
            });

            target.games++;
            target.won += Number(game.won);
            target.drawn += Number(game.drawn);
          }
        }
      }
    }

    const list = Object.values(countries);

    for (const player of list) {
      player.lost = player.games - player.won - player.drawn;
      player.wonPercent = player.won / player.games;
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [country, t]);
  const hasDraws = data.some((opponent) => opponent.drawn > 0);

  const columns = useMemo<ColumnDef<CountryOpponentRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'name',
            header: t('table.country'),
            cell: (info) => (
              <CountryLink
                event={event}
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
        ] as ColumnDef<CountryOpponentRow>[]
      ).filter(Boolean),
    [translations, t, event, hasDraws]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
