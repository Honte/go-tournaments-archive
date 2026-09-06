'use client';

import { useMemo } from 'react';
import type { PlayerStats, TableStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { sortTableStats } from '@/libs/sort';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { CountryLink } from '@/components/ui/CountryLink';
import { Loader } from '@/components/ui/Loader';
import { PlayerCell } from '@/components/ui/PlayerCell';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type AllPlayersStatsProps = {
  event: EventContext;
  players: Record<string, PlayerStats>;
  locale: Locale;
};

type AllPlayersStatsContentProps = {
  event: EventContext;
  players: Record<string, PlayerStats>;
  translations: Translations;
};

type PlayerRow = TableStats & {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  country: string;
  countries: string[];
  sgfs: number;
};

export function AllPlayersStats({ event, players, locale }: AllPlayersStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);

  if (!translations) {
    return <Loader />;
  }

  return <AllPlayersStatsContent event={event} players={players} translations={translations} />;
}

function AllPlayersStatsContent({ event, players, translations }: AllPlayersStatsContentProps) {
  const t = getTranslator(translations);
  const formatter = getFormatter(translations.locale);

  const data = useMemo(
    () =>
      Object.values(players)
        .filter((p) => p.id !== 'BYE')
        .map<PlayerRow>((p) => {
          const {
            id,
            name,
            medals,
            totalAttended,
            totalGames,
            totalWon,
            totalDrawn,
            bestPlace,
            country: countries,
            totalSgfs,
          } = p;
          const [firstName, lastName] = (name ?? '').split(' ');
          const [gold, silver, bronze] = medals;

          // for sorting
          const country = countries.toSorted((a, b) => a.localeCompare(b)).join(',');

          return {
            id,
            name: name ?? '',
            firstName,
            lastName,
            country,
            countries,
            bestPlace,
            gold: gold.length,
            silver: silver.length,
            bronze: bronze.length,
            attended: totalAttended,
            games: totalGames,
            won: totalWon,
            drawn: totalDrawn,
            lost: totalGames - totalWon - totalDrawn,
            wonPercent: totalWon / totalGames,
            sgfs: totalSgfs,
          };
        })
        .sort(sortTableStats),
    [players]
  );

  const hasSgfs = data.some((p) => p.sgfs > 0);
  const hasDraws = data.some((p) => p.drawn > 0);

  const columns = useMemo<StatsColumnDef<PlayerRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'firstName',
            header: t('table.firstName'),
            cell: (info) => (
              <PlayerCell
                event={event}
                player={info.row.original}
                locale={translations.locale}
                showRank={false}
                showCountry={false}
              />
            ),
            spanColumns: 2,
          },
          {
            accessorKey: 'lastName',
            header: t('table.lastName'),
          },
          event.showCountry && {
            accessorKey: 'country',
            header: t('table.country'),
            cell: (info) =>
              jsxJoin(
                info.row.original.countries.map((code) => (
                  <CountryLink event={event} key={code} translations={translations} code={code} />
                )),
                ', '
              ),
          },
          event.showBestPlace && {
            accessorKey: 'bestPlace',
            header: t('table.best'),
            cell: formatter.toNumericCell,
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
          hasDraws && {
            accessorKey: 'drawn',
            header: t('table.drawn'),
          },
          {
            accessorKey: 'lost',
            header: t('table.lost'),
          },
          hasSgfs && {
            accessorKey: 'sgfs',
            header: t('table.sgfs'),
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: formatter.toPercentageCell,
          },
        ] as StatsColumnDef<PlayerRow>[]
      ).filter(Boolean),
    [t, translations, hasSgfs, hasDraws, event, formatter]
  );

  return <StatsTable columns={columns} data={data} />;
}
