'use client';

import { useMemo } from 'react';
import type { CountryStats, TableStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getGameStats } from '@/libs/games';
import { sortTableStats } from '@/libs/sort';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';

type CountryPlayerProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
  category?: string;
};

type CountryPlayerRow = TableStats & {
  id: string;
  name: string;
  sgfs: number;
};

export function CountryPlayers({ event, country, translations, category }: CountryPlayerProps) {
  const t = getTranslator(translations);
  const formatter = getFormatter(translations.locale);

  const data = useMemo(() => {
    const players: Record<string, CountryPlayerRow> = {};
    const sgfs: Record<string, Set<string>> = {};

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        const playerSgfs = (sgfs[result.id] ||= new Set<string>());
        const player = (players[result.id] ||= {
          id: result.id,
          name: result.name,
          sgfs: 0,
          games: 0,
          won: 0,
          drawn: 0,
          unresolved: 0,
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
          for (const game of stage.games) {
            if (game.props?.sgf) {
              playerSgfs.add(game.props.sgf);
            }
          }
          const outcomes = getGameStats(stage.games);
          player.games += outcomes.games;
          player.won += outcomes.won;
          player.drawn += outcomes.drawn;
          player.unresolved += outcomes.unresolved;
        }
      }
    }

    const list = Object.values(players);

    for (const player of list) {
      player.sgfs = sgfs[player.id].size;
      player.lost = player.games - player.won - player.drawn;
      player.wonPercent = player.won / player.games;
    }

    return list.sort(sortTableStats);
  }, [country]);
  const hasDraws = data.some((player) => player.drawn > 0);
  const hasSgfs = data.some((player) => player.sgfs > 0);
  const hasUnresolved = data.some((row) => row.unresolved > 0);

  const columns = useMemo<StatsColumnDef<CountryPlayerRow>[]>(
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
            cell: formatter.toNumericCell,
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
          hasUnresolved && {
            accessorKey: 'unresolved',
            header: t('table.unresolved'),
          },
          hasSgfs && {
            accessorKey: 'sgfs',
            header: t('table.sgfs'),
            cell: ({ row }) => (
              <SgfCountLink
                event={event}
                locale={translations.locale}
                count={row.original.sgfs}
                filters={{ player: row.original.id, country: country.code, category }}
              />
            ),
          },
          {
            accessorKey: 'wonPercent',
            header: t('table.wonPercent'),
            cell: formatter.toPercentageCell,
          },
        ] as StatsColumnDef<CountryPlayerRow>[]
      ).filter(Boolean),
    [translations, t, event, hasDraws, hasUnresolved, hasSgfs, country.code, category, formatter]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t('stats.players')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
