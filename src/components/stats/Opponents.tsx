'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

type OpponentsProps = {
  event: EventContext;
  translations: Translations;
  player: PlayerStats;
};

type OpponentRow = {
  id: string;
  name: string;
  games: number;
  won: number;
  drawn: number;
  firstName: string;
  lastName: string;
  lost: number;
  wonPercent: number;
  country: string;
};

export function Opponents({ event, translations, player }: OpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const stats: Record<string, { won: number; drawn: number; games: number; countries: Set<string | undefined> }> = {};

    for (const event of player.results) {
      for (const stage of event.stages) {
        for (const game of stage.games) {
          if (game.id === 'BYE') {
            continue;
          }

          const opponent = (stats[game.id] ||= {
            games: 0,
            won: 0,
            drawn: 0,
            countries: new Set(),
          });

          opponent.games += 1;
          opponent.won += Number(game.won);
          opponent.drawn += Number(game.drawn);
          opponent.countries.add(game.country);
        }
      }
    }

    return Object.entries(stats)
      .map<OpponentRow>(([id, { games, won, drawn, countries }]) => {
        const name = player.opponents[id];
        const [firstName, ...rest] = name.split(' ');
        const lastName = rest.join(' ') || '';
        const country = Array.from(countries).filter(Boolean).join(', ');
        const lost = games - won - drawn;
        const wonPercent = won / games;

        return {
          id,
          name,
          firstName,
          lastName,
          country,
          games,
          won,
          drawn,
          lost,
          wonPercent,
        };
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [player]);
  const hasDraws = data.some((opponent) => opponent.drawn > 0);

  const columns = useMemo<ColumnDef<OpponentRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'firstName',
            header: t('table.firstName'),
            cell: (info) => (
              <PlayerCell event={event} player={info.row.original} locale={translations.locale} showRank={false} />
            ),
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
          hasDraws && {
            accessorKey: 'drawn',
            header: t('table.drawn'),
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
        ] as ColumnDef<OpponentRow>[]
      ).filter(Boolean),
    [translations, t, event, hasDraws]
  );

  return (
    <div className="flex-1">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
