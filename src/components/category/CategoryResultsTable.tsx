'use client';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import type { CategoryPlayer, CategoryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator, translate } from '@/i18n/translator';
import { createPodiumColumnSorter } from '@/libs/sort';
import type { KeysMatching } from '@/libs/types';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H1 } from '@/components/ui/H1';
import { PodiumCell } from '@/components/ui/PodiumCell';
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

  const columns = useMemo<StatsColumnDef<SummaryRow>[]>(() => {
    const t = getTranslator(translations);
    const podiumColumn = (key: MedalKey, label: string): StatsColumnDef<SummaryRow> => ({
      accessorFn: (row) => (row[key]?.length ? row[key] : undefined),
      header: t(label),
      meta: { className: 'text-left align-top' },
      cell: (info) => (
        <PodiumCell
          event={event}
          players={info.row.original[key]}
          locale={translations.locale}
          isDescending={info.column.getIsSorted() === 'desc'}
        />
      ),
      sortFn: createPodiumColumnSorter(translations.locale),
      sortUndefined: 'last',
    });

    return [
      {
        accessorKey: 'year',
        header: t('table.year'),
        cell: (info) => <YearLink event={event} year={info.row.original.year} locale={translations.locale} />,
      },
      podiumColumn('gold', 'winners.first'),
      podiumColumn('silver', 'winners.second'),
      podiumColumn('bronze', 'winners.third'),
      {
        accessorKey: 'players',
        header: t('table.players'),
      },
    ];
  }, [translations, event]);

  return (
    <div className={clsx('flex-2 flex-col', className)}>
      <H1
        actions={
          hasUnsure ? (
            <Toggle checked={includeUnsure} onChange={setIncludeUnsure}>
              {translate(translations, 'stats.includeUnsurePlayers')}
            </Toggle>
          ) : undefined
        }
      >
        {translate(translations, 'stats.summary')}
      </H1>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
