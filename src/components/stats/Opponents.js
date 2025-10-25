'use client';

import { getTranslator } from '@/i18n/translator';
import { H2 } from '@/components/ui/H2';
import { useMemo } from 'react';
import { StatsTable } from '@/components/table/StatsTable';
import { toPercentage, toPlayerLink } from '@/libs/table';

export function Opponents({ player, translations, players }) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const opponents = {};

    for (const event of player.results) {
      for (const game of event.games) {
        const playerStats = opponents[game.opponent] ||= {
          id: game.opponent,
          name: players[game.opponent].name,
          games: 0,
          won: 0,
          years: new Set()
        };

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
          lost: games - won,
          wonPercent: won / games
        };
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [player, players]);

  const columns = useMemo(() => [
    {
      accessorKey: 'firstName',
      header: t('table.firstName'),
      cell: (info) => toPlayerLink(info, translations),
      span: 2
    },
    {
      accessorKey: 'lastName',
      header: t('table.lastName'),
      skip: true
    },
    {
      accessorKey: 'games',
      header: t('table.games')
    },
    {
      accessorKey: 'won',
      header: t('table.won')
    },
    {
      accessorKey: 'lost',
      header: t('table.lost')
    },
    {
      accessorKey: 'wonPercent',
      header: t('table.wonPercent'),
      cell: toPercentage
    }
  ], [translations, t]);

  return (
    <div className="my-2">
      <H2>{t('stats.opponents')}</H2>
      <StatsTable data={data} columns={columns}/>
    </div>
  );
}
