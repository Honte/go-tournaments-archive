'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { CountryStats, TableStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { sortTableStats } from '@/libs/sort';
import { toNumeric, toPercentage } from '@/libs/table';
import { StatsTable } from '@/components/table/StatsTable';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';

type CountryPlayerProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
};

type CountryPlayerRow = TableStats & {
  id: string;
  name: string;
};

export function CountryPlayers({ event, country, translations }: CountryPlayerProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => {
    const players: Record<string, CountryPlayerRow> = {};

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        const player = (players[result.id] ||= {
          id: result.id,
          name: result.name,
          games: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          wonPercent: 0,
          attended: 0,
          gold: 0,
          bronze: 0,
          silver: 0,
          bestPlace: Infinity,
        });

        player.attended++;
        player.bestPlace = Math.min(player.bestPlace, result.place);
        if (result.place === 1) {
          player.gold++;
        }
        if (result.place === 2) {
          player.silver++;
        }
        if (result.place === 3) {
          player.bronze++;
        }

        for (const stage of result.stages) {
          player.games += stage.games.length;
          player.won += stage.games.reduce((total, game) => total + Number(game.won), 0);
          player.drawn += stage.games.reduce((total, game) => total + Number(game.drawn), 0);
        }
      }
    }

    const list = Object.values(players);

    for (const player of list) {
      player.lost = player.games - player.won - player.drawn;
      player.wonPercent = player.won / player.games;
    }

    return list.sort(sortTableStats);
  }, [country]);
  const hasDraws = data.some((player) => player.drawn > 0);

  const columns = useMemo<ColumnDef<CountryPlayerRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'name',
            header: t('table.player'),
            cell: (info) => (
              <PlayerLink
                event={event}
                playerId={info.row.original.id}
                locale={translations.locale}
                className="block text-left"
              >
                {info.row.original.name}
              </PlayerLink>
            ),
          },
          event.showBestPlace && {
            accessorKey: 'bestPlace',
            header: t('table.best'),
            cell: toNumeric,
          },
          {
            accessorKey: 'gold',
            header: t('medals.gold'),
          },
          {
            accessorKey: 'silver',
            header: t('medals.silver'),
          },
          {
            accessorKey: 'bronze',
            header: t('medals.bronze'),
          },
          {
            accessorKey: 'attended',
            header: t('table.events'),
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
        ] as ColumnDef<CountryPlayerRow>[]
      ).filter(Boolean),
    [translations, t, event, hasDraws]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.players')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
