'use client';
import type { ColumnDef, SortingFn } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import type { CategoryPlayer, CategoryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import type { KeysMatching } from '@/libs/types';
import { StatsTable } from '@/components/table/StatsTable';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { Toggle } from '@/components/ui/Toggle';
import { YearLink } from '@/components/YearLink';

export type CategoryResultsTableProps = {
  event: EventContext;
  category: string;
  stats: CategoryStats;
  translations: Translations;
  className?: string;
};

type SummaryRow = {
  year: number;
  gold: CategoryPlayer[];
  silver: CategoryPlayer[];
  bronze: CategoryPlayer[];
  players: number;
  hasUnsure?: boolean;
};
type MedalKey = KeysMatching<SummaryRow, CategoryPlayer[]>;

export function CategoryResultsTable({ event, translations, stats, className }: CategoryResultsTableProps) {
  const [includeUnsure, setIncludeUnsure] = useState(true);
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const result: SummaryRow[] = [];

    for (const tournament of stats.tournaments) {
      const byPlace: Partial<Record<CategoryPlayer['place'], CategoryPlayer[]>> = {};

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

    return result.sort((a, b) => b.year - a.year);
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
          <PlayerLink key={p.id} event={event} playerId={p.id} locale={translations.locale}>
            <PlayerName player={p} showCountry={event.showCountry} />
          </PlayerLink>
        )),
        ', '
      ),
    [translations.locale, event]
  );

  const columns = useMemo(
    () =>
      (
        [
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => <YearLink event={event} year={info.row.original.year} locale={translations.locale} />,
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
    [t, translations.locale, sortByFirstPlayer, renderPlayers, event]
  );

  return (
    <div className={clsx('flex-2 flex-col', className)}>
      <H1>{t('stats.summary')}</H1>
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
