'use client';

import type { StatsPlayer } from '@/schema/data';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

type OpponentsProps = {
  player: StatsPlayer;
  translations: Translations;
  players: Record<string, StatsPlayer>;
};

type Opponent = {
  id: string;
  name: string;
  games: number;
  won: number;
  years: Set<number>;
};

type OpponentRow = Opponent & {
  firstName: string;
  lastName: string;
  lost: number;
  wonPercent: number;
  country: string;
};

export function Opponents({ player, translations, players }: OpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const opponents: Record<string, Opponent> = {};

    for (const event of player.results) {
      for (const game of event.games) {
        const playerStats = (opponents[game.opponent] ||= {
          id: game.opponent,
          name: players[game.opponent]?.name ?? game.opponent,
          games: 0,
          won: 0,
          years: new Set<number>(),
        });

        playerStats.games++;
        playerStats.won += Number(game.won);
        playerStats.years.add(event.year);
      }
    }

    return Object.values(opponents)
      .filter((op) => op.id !== 'BYE')
      .map((opponent) => {
        const { name, games, won } = opponent;
        const [firstName, lastName] = name.split(' ');

        return {
          ...opponent,
          firstName,
          lastName,
          country: Array.from(players[opponent.id]?.countries).join(', '),
          lost: games - won,
          wonPercent: won / games,
        } as OpponentRow;
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [player, players]);

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
