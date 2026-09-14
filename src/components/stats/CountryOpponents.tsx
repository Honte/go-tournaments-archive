'use client';

import { useMemo } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';

type CountryOpponentsProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
  category?: string;
};

type CountryOpponentRow = {
  code: string;
  name: string;
  games: number;
  sgfs: number;
  won: number;
  drawn: number;
  unresolved: number;
  lost: number;
  wonPercent: number;
};

export function CountryOpponents({ event, country, translations, category }: CountryOpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const countries: Record<string, CountryOpponentRow> = {};
    const sgfs: Record<string, Set<string>> = {};

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
              sgfs: 0,
              won: 0,
              drawn: 0,
              unresolved: 0,
              lost: 0,
              wonPercent: 0,
            });

            target.games += Number(!game.unresolved);
            target.unresolved += Number(Boolean(game.unresolved));
            target.won += Number(game.won);
            target.drawn += Number(Boolean(game.drawn));
            if (game.props?.sgf) {
              (sgfs[game.country] ||= new Set<string>()).add(game.props.sgf);
            }
          }
        }
      }
    }

    const list = Object.values(countries);

    for (const player of list) {
      player.sgfs = sgfs[player.code]?.size ?? 0;
      player.lost = player.games - player.won - player.drawn;
      player.wonPercent = player.won / player.games;
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [country, t]);
  const hasDraws = data.some((opponent) => opponent.drawn > 0);
  const hasUnresolved = data.some((row) => row.unresolved > 0);
  const hasSgfs = data.some((row) => row.sgfs > 0);

  const columns = useMemo<StatsColumnDef<CountryOpponentRow>[]>(
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
          hasUnresolved && {
            accessorKey: 'unresolved',
            header: t('table.unresolved'),
          },
          hasSgfs && {
            accessorKey: 'sgfs',
            header: t('table.sgfs'),
            cell: ({ row }) => (
              <SgfCountLink
                event={event}
                locale={translations.locale}
                count={row.original.sgfs}
                filters={{ country: country.code, opponentCountry: row.original.code, category }}
              />
            ),
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: getFormatter(translations.locale).toPercentageCell,
          },
        ] as StatsColumnDef<CountryOpponentRow>[]
      ).filter(Boolean),
    [translations, t, event, hasDraws, hasUnresolved, hasSgfs, country.code, category]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
