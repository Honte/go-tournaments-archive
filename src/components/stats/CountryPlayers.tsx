'use client';

import { useMemo } from 'react';
import type { CountryStats, TableStats, Participant } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getGameStats } from '@/libs/games';
import { getParticipantName, getParticipantPlayers, isPair } from '@/libs/participants';
import { sortTableStats } from '@/libs/sort';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

type CountryPlayerProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
  category?: string;
  pairs?: boolean;
};

type CountryPlayerRow = TableStats & {
  participant: Participant;
  id: string;
  name: string;
  sgfs: number;
};

export function CountryPlayers({ event, country, translations, category, pairs = false }: CountryPlayerProps) {
  const t = getTranslator(translations);
  const formatter = getFormatter(translations.locale);

  const data = useMemo(() => {
    const players: Record<string, CountryPlayerRow> = {};
    const sgfs: Record<string, Set<string>> = {};

    for (const year in country.years) {
      const yearData = country.years[year];

      for (const result of yearData.results) {
        const source = result.participant ?? { id: result.id, name: result.name };
        for (const participant of pairs ? [source] : getParticipantPlayers(source)) {
          const playerSgfs = (sgfs[participant.id] ||= new Set<string>());
          const player = (players[participant.id] ||= {
            id: participant.id,
            participant,
            name: getParticipantName(participant),
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
    }

    const list = Object.values(players);

    for (const player of list) {
      player.sgfs = sgfs[player.id].size;
      player.lost = player.games - player.won - player.drawn;
      player.wonPercent = player.won / player.games;
    }

    return list.sort(sortTableStats);
  }, [country, pairs]);

  const hasSgfs = event.generateSgfs && data.some((row) => row.sgfs > 0);
  const hasDraws = data.some((player) => player.drawn > 0);
  const hasUnresolved = data.some((row) => row.unresolved > 0);

  const columns = useMemo<StatsColumnDef<CountryPlayerRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t(pairs ? 'table.pair' : 'table.player'),
        meta: { className: 'text-left' },
        cell: (info) => (
          <PlayerCell
            event={event}
            locale={translations.locale}
            player={info.row.original.participant}
            showRank={false}
            showCountry={false}
          />
        ),
      },
      {
        accessorKey: 'bestPlace',
        header: t('table.best'),
        enabled: event.showBestPlace,
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
      {
        accessorKey: 'drawn',
        header: t('table.drawn'),
        enabled: hasDraws,
      },
      {
        accessorKey: 'lost',
        header: t('table.lost'),
      },
      {
        accessorKey: 'unresolved',
        header: t('table.unresolved'),
        enabled: hasUnresolved,
      },
      {
        accessorKey: 'sgfs',
        header: t('table.sgfs'),
        enabled: hasSgfs,
        cell: ({ row }) => (
          <SgfCountLink
            event={event}
            locale={translations.locale}
            count={row.original.sgfs}
            filters={{
              player: getParticipantPlayers(row.original.participant)[0].id,
              partner: isPair(row.original.participant) ? row.original.participant.members[1].id : undefined,
              country: country.code,
              category,
            }}
          />
        ),
      },
      {
        accessorKey: 'wonPercent',
        header: t('table.wonPercent'),
        cell: formatter.toPercentageCell,
      },
    ],
    [translations, t, event, hasDraws, hasUnresolved, hasSgfs, country.code, category, formatter, pairs]
  );

  return (
    <div className="my-2 flex-1">
      <H2>{t(pairs ? 'stats.pairs' : 'stats.players')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
