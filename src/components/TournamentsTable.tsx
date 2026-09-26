'use client';

import { useMemo } from 'react';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import {
  createCountryColumnSorter,
  createDateRangeColumnSorter,
  createLocaleColumnSorter,
  createPodiumColumnSorter,
} from '@/libs/sort';
import type { PodiumKey, TournamentRow } from '@/libs/tournaments';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { PodiumCell } from '@/components/ui/PodiumCell';
import { YearLink } from '@/components/YearLink';

type TournamentsTableProps = {
  event: EventContext;
  rows: TournamentRow[];
  translations: Translations;
  showSgfs: boolean;
};

const INITIAL_STATE = {
  sorting: [{ id: 'year', desc: true }],
};

export function TournamentsTable({ event, rows, translations, showSgfs }: TournamentsTableProps) {
  const t = useMemo(() => getTranslator(translations), [translations]);
  const locale = translations.locale;
  const formatter = useMemo(() => getFormatter(locale), [locale]);
  const showStages = rows.some((row) => row.stages !== rows[0]?.stages);
  const hasReferee = rows.some((row) => row.referee);

  const columns = useMemo<StatsColumnDef<TournamentRow>[]>(() => {
    const podiumColumn = (key: PodiumKey, label: string): StatsColumnDef<TournamentRow> => ({
      accessorFn: (row) => (row[key]?.length ? row[key] : undefined),
      header: t(label),
      meta: { className: 'text-left align-top' },
      cell: (info) => (
        <PodiumCell
          event={event}
          players={info.row.original[key]}
          locale={locale}
          isDescending={info.column.getIsSorted() === 'desc'}
        />
      ),
      sortFn: createPodiumColumnSorter(locale),
      sortUndefined: 'last',
    });

    return [
      {
        accessorKey: 'year',
        header: t('table.year'),
        cell: (info) => <YearLink event={event} year={info.row.original.year} locale={locale} />,
      },
      {
        accessorKey: 'location',
        header: t('details.location'),
        cell: (info) => info.row.original.location ?? '—',
        sortFn: createLocaleColumnSorter(locale),
        sortUndefined: 'last',
      },
      {
        accessorKey: 'country',
        header: t('table.country'),
        enabled: event.showCountry,
        cell: (info) => (info.row.original.country ? t(`country.${info.row.original.country}`) : '—'),
        sortFn: createCountryColumnSorter((code) => t(`country.${code}`), locale),
      },
      {
        id: 'dates',
        accessorFn: (row) => row.start ?? row.end,
        header: t('stage.date'),
        cell: (info) => info.row.original.dates ?? '—',
        sortFn: createDateRangeColumnSorter(),
      },
      podiumColumn('gold', 'winners.first'),
      podiumColumn('silver', 'winners.second'),
      podiumColumn('bronze', 'winners.third'),
      {
        accessorKey: 'referee',
        header: t('details.referee'),
        enabled: hasReferee,
        cell: (info) => info.row.original.referee ?? '—',
        sortFn: createLocaleColumnSorter(locale),
        sortUndefined: 'last',
      },
      {
        accessorKey: 'players',
        header: t('table.players'),
        cell: formatter.toNumericCell,
      },
      {
        accessorKey: 'stages',
        header: t('table.stages'),
        enabled: showStages,
        cell: formatter.toNumericCell,
      },
      {
        accessorKey: 'games',
        header: t('table.games'),
        cell: formatter.toNumericCell,
      },
      {
        accessorKey: 'sgfs',
        header: t('table.sgfs'),
        enabled: showSgfs,
        cell: ({ row }) => (
          <SgfCountLink
            event={event}
            locale={locale}
            count={row.original.sgfs}
            filters={{ years: [row.original.year], group: 'year-round' }}
          />
        ),
      },
    ];
  }, [event, t, locale, showSgfs, showStages, formatter, hasReferee]);

  return <StatsTable data={rows} columns={columns} initialState={INITIAL_STATE} />;
}
