'use client';

import type { StatsOpponent } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

type OpponentsProps = {
  translations: Translations;
  opponents: StatsOpponent[];
};

type OpponentRow = {
  id: string;
  name: string;
  games: number;
  won: number;
  firstName: string;
  lastName: string;
  lost: number;
  wonPercent: number;
  country: string;
};

export function Opponents({ translations, opponents }: OpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    return opponents
      .map<OpponentRow>((opponent) => {
        const { name, games, id, countries } = opponent;
        const [firstName, ...rest] = name.split(' ');
        const won = games.filter((g) => g.won);

        return {
          id,
          name,
          firstName,
          lastName: rest.join(' ') || '',
          country: countries.join(', '),
          games: games.length,
          won: won.length,
          lost: games.length - won.length,
          wonPercent: won.length / games.length,
        };
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [opponents]);

  const columns = useMemo<ColumnDef<OpponentRow>[]>(
    () =>
      [
        {
          accessorKey: 'firstName',
          header: t('table.firstName'),
          cell: (info) => <PlayerCell player={info.row.original} locale={translations.locale} includeRank={false} />,
          meta: { span: 2 },
        },
        {
          accessorKey: 'lastName',
          header: t('table.lastName'),
          meta: { skip: true },
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
      ] as ColumnDef<OpponentRow>[],
    [translations, t]
  );

  return (
    <div className="my-2">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
