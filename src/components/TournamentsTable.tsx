'use client';

import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { DEFAULT_GAME_RECORDS_STATE } from '@/libs/gameRecords/schema';
import { serializeGameRecordsState } from '@/libs/gameRecords/urlState';
import {
  sortPodium,
  sortTournamentRows,
  type PodiumKey,
  type TournamentRow,
  type TournamentSortKey,
} from '@/libs/tournaments';
import { allGameStatsUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { useStatsTable, type StatsColumnDef } from '@/components/table/statsTableConfig';
import { TableHeader } from '@/components/table/TableHeader';
import { TableRow } from '@/components/table/TableRow';
import { PlayerCell } from '@/components/ui/PlayerCell';
import { YearLink } from '@/components/YearLink';

type TournamentsTableProps = {
  event: EventContext;
  rows: TournamentRow[];
  translations: Translations;
  showSgfs: boolean;
};

export function TournamentsTable({ event, rows, translations, showSgfs }: TournamentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'year', desc: true }]);
  const t = useMemo(() => getTranslator(translations), [translations]);
  const locale = translations.locale;
  const formatter = useMemo(() => getFormatter(locale), [locale]);
  const activeSort = sorting[0];
  const showStages = rows.some((row) => row.stages !== rows[0]?.stages);

  const data = useMemo(
    () =>
      sortTournamentRows(
        rows,
        (activeSort?.id ?? 'year') as TournamentSortKey,
        activeSort?.desc ?? true,
        locale,
        (code) => t(`country.${code}`)
      ),
    [rows, activeSort, locale, t]
  );

  const columns = useMemo<StatsColumnDef<TournamentRow>[]>(() => {
    const podiumColumn = (key: PodiumKey, label: string): StatsColumnDef<TournamentRow> => ({
      accessorKey: key,
      header: t(label),
      meta: { className: 'text-left align-top' },
      cell: (info) => {
        const players = sortPodium(info.row.original[key], locale, activeSort?.id === key && activeSort.desc);
        return players.length ? (
          <div className="flex flex-col gap-1">
            {players.map((player) => (
              <PlayerCell key={player.id} event={event} player={player} locale={locale} />
            ))}
          </div>
        ) : (
          '—'
        );
      },
    });

    return [
      {
        accessorKey: 'year',
        header: t('table.year'),
        cell: (info) => <YearLink event={event} year={info.row.original.year} locale={locale} />,
      },
      { accessorKey: 'location', header: t('details.location'), cell: (info) => info.row.original.location ?? '—' },
      ...(event.showCountry
        ? [
            {
              accessorKey: 'country',
              header: t('table.country'),
              cell: (info) => (info.row.original.country ? t(`country.${info.row.original.country}`) : '—'),
            } satisfies StatsColumnDef<TournamentRow>,
          ]
        : []),
      {
        id: 'dates',
        accessorFn: (row) => row.start ?? row.end,
        header: t('stage.date'),
        cell: (info) => info.row.original.dates ?? '—',
      },
      podiumColumn('gold', 'winners.first'),
      podiumColumn('silver', 'winners.second'),
      podiumColumn('bronze', 'winners.third'),
      { accessorKey: 'players', header: t('table.players'), cell: formatter.toNumericCell },
      ...(showStages
        ? [
            {
              accessorKey: 'stages',
              header: t('table.stages'),
              cell: formatter.toNumericCell,
            } satisfies StatsColumnDef<TournamentRow>,
          ]
        : []),
      { accessorKey: 'games', header: t('table.games'), cell: formatter.toNumericCell },
      ...(showSgfs
        ? [
            {
              accessorKey: 'sgfs',
              header: t('table.sgfs'),
              cell: (info) => {
                const { year, sgfs } = info.row.original;
                const query = serializeGameRecordsState({
                  ...DEFAULT_GAME_RECORDS_STATE,
                  years: [year],
                  group: 'year-round',
                });
                return sgfs > 0 ? (
                  <Link
                    className="text-archive-link underline hover:text-archive-link-hover"
                    href={`${allGameStatsUrl(event, locale)}?${query}`}
                  >
                    {formatter.toCount(sgfs)}
                  </Link>
                ) : (
                  0
                );
              },
            } satisfies StatsColumnDef<TournamentRow>,
          ]
        : []),
    ];
  }, [event, t, locale, showSgfs, showStages, activeSort, formatter]);

  const table = useStatsTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <TableHeader table={table} />
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} className="even:bg-archive-row-stripe" />
          ))}
        </tbody>
      </table>
    </div>
  );
}
