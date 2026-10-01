'use client';

import { useMemo } from 'react';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getOpponentRows, type RelatedPlayerRow } from '@/libs/pairStats';
import { getParticipantPlayers, isPair } from '@/libs/participants';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

type OpponentsProps = {
  event: EventContext;
  translations: Translations;
  player: PlayerStats;
  category?: string;
  pairs?: boolean;
};

type OpponentRow = RelatedPlayerRow;

export function Opponents({ event, translations, player, category, pairs = false }: OpponentsProps) {
  const t = getTranslator(translations);

  const data = useMemo(() => getOpponentRows(player, pairs), [player, pairs]);
  const hasSgfs = event.generateSgfs && data.some((row) => row.sgfs > 0);
  const hasDraws = data.some((opponent) => opponent.drawn > 0);
  const hasUnresolved = data.some((row) => row.unresolved > 0);

  const columns = useMemo<StatsColumnDef<OpponentRow>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: t(pairs ? 'table.pair' : 'table.firstName'),
        meta: { className: 'text-left' },
        cell: (info) => (
          <PlayerCell
            event={event}
            player={info.row.original.participant}
            locale={translations.locale}
            showRank={false}
          />
        ),
        spanColumns: pairs ? 1 : 2,
      },
      {
        enabled: !pairs,
        accessorKey: 'lastName',
        header: t('table.lastName'),
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
              player: player.id,
              opponent: getParticipantPlayers(row.original.participant)[0].id,
              opponentPartner: isPair(row.original.participant) ? row.original.participant.members[1].id : undefined,
              category,
            }}
          />
        ),
      },
      {
        accessorKey: 'wonPercent',
        header: t('table.wonPercent'),
        cell: getFormatter(translations.locale).toPercentageCell,
      },
    ],
    [translations, t, event, hasDraws, hasUnresolved, hasSgfs, player.id, category, pairs]
  );

  return (
    <div className="flex-1">
      <H2>{t(pairs ? 'stats.opponentPairs' : 'stats.opponents')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
