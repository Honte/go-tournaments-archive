'use client';
import type { StatsCategory, StatsCategoryPlayer } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

export type CategoryResultsTableProps = {
  category: string;
  stats: StatsCategory;
  translations: Translations;
};

type SummaryRow = {
  year: number;
  gold: StatsCategoryPlayer[];
  silver: StatsCategoryPlayer[];
  bronze: StatsCategoryPlayer[];
  totalPlayers: number;
  unsurePlayers: number;
  surePlayers: number;
};

export function CategoryResultsTable({ translations, stats }: CategoryResultsTableProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const result: SummaryRow[] = [];

    for (const tournament of stats.tournaments) {
      const byPlace: Partial<Record<StatsCategoryPlayer['place'], StatsCategoryPlayer[]>> = {};

      for (const player of tournament.results) {
        (byPlace[player.place] ||= []).push(player);
      }

      const possiblePlayers = byPlace['?']?.length ?? 0;

      result.push({
        year: tournament.year,
        gold: byPlace[1] || [],
        silver: byPlace[2] || [],
        bronze: byPlace[3] || [],
        surePlayers: tournament.results.length - possiblePlayers,
        unsurePlayers: possiblePlayers,
        totalPlayers: tournament.results.length,
      });
    }

    return result;
  }, [stats.tournaments]);

  const columns = useMemo(
    () =>
      (
        [
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => <YearLink year={info.row.original.year} locale={translations.locale} />,
          },
          {
            accessorKey: 'gold',
            header: t('winners.first'),
            cell: (info) =>
              jsxJoin(
                info.row.original.gold.map((p) => (
                  <PlayerLink key={p.id} playerId={p.id} locale={translations.locale}>
                    <PlayerName player={p} />
                  </PlayerLink>
                )),
                ', '
              ),
          },
          {
            accessorKey: 'silver',
            header: t('winners.second'),
            cell: (info) =>
              jsxJoin(
                info.row.original.silver.map((p) => (
                  <PlayerLink key={p.id} playerId={p.id} locale={translations.locale}>
                    <PlayerName player={p} />
                  </PlayerLink>
                )),
                ', '
              ),
          },
          {
            accessorKey: 'bronze',
            header: t('winners.third'),
            cell: (info) =>
              jsxJoin(
                info.row.original.bronze.map((p) => (
                  <PlayerLink key={p.id} playerId={p.id} locale={translations.locale}>
                    <PlayerName player={p} />
                  </PlayerLink>
                )),
                ', '
              ),
          },
          {
            accessorKey: 'surePlayers',
            header: t('table.surePlayers'),
          },
          {
            accessorKey: 'unsurePlayers',
            header: t('table.unsurePlayers'),
          },
          {
            accessorKey: 'totalPlayers',
            header: t('table.players'),
          },
        ] as ColumnDef<SummaryRow>[]
      ).filter(Boolean),
    [t, translations.locale]
  );

  return (
    <div className="flex-2 flex-col">
      <H2>{t('stats.summary')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
