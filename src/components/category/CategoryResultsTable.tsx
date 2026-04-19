'use client';
import type { StatsCategory, StatsCategoryPlayer } from '@/schema/data';
import type { ColumnDef, SortingFn } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import type { KeysMatching } from '@/libs/types';
import { YearLink } from '@/components/YearLink';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { Toggle } from '@/components/ui/Toggle';

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
  players: number;
  hasUnsure?: boolean;
};
type MedalKey = KeysMatching<SummaryRow, StatsCategoryPlayer[]>;

export function CategoryResultsTable({ translations, stats }: CategoryResultsTableProps) {
  const [includeUnsure, setIncludeUnsure] = useState(true);
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
        players: includeUnsure ? tournament.results.length : tournament.results.length - possiblePlayers,
        hasUnsure: possiblePlayers > 0,
      });
    }

    return result;
  }, [includeUnsure, stats.tournaments]);

  const hasUnsure = data.some((r) => r.hasUnsure);

  const sortByFirstPlayer = useCallback<(key: MedalKey) => SortingFn<SummaryRow>>(
    (key) => (a, b) =>
      (a.original[key][0]?.name ?? '').localeCompare(b.original[key][0]?.name ?? '', translations.locale),
    [translations.locale]
  );

  const renderPlayers = useCallback<(key: MedalKey) => ColumnDef<SummaryRow>['cell']>(
    (key) => (info) =>
      jsxJoin(
        info.row.original[key].map((p) => (
          <PlayerLink key={p.id} playerId={p.id} locale={translations.locale}>
            <PlayerName player={p} />
          </PlayerLink>
        )),
        ', '
      ),
    [translations.locale]
  );

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
            cell: renderPlayers('gold'),
            sortingFn: sortByFirstPlayer('gold'),
          },
          {
            accessorKey: 'silver',
            header: t('winners.second'),
            cell: renderPlayers('silver'),
            sortingFn: sortByFirstPlayer('silver'),
          },
          {
            accessorKey: 'bronze',
            header: t('winners.third'),
            cell: renderPlayers('bronze'),
            sortingFn: sortByFirstPlayer('bronze'),
          },
          {
            accessorKey: 'players',
            header: t('table.players'),
          },
        ] as ColumnDef<SummaryRow>[]
      ).filter(Boolean),
    [t, translations.locale, sortByFirstPlayer, renderPlayers]
  );

  return (
    <div className="flex-2 flex-col">
      <H2>{t('stats.summary')}</H2>
      <StatsTable data={data} columns={columns} />
      {hasUnsure && (
        <div className="flex p-2">
          <Toggle checked={includeUnsure} onChange={setIncludeUnsure} className="ml-auto">
            {t('stats.includeUnsurePlayers')}
          </Toggle>
        </div>
      )}
    </div>
  );
}
