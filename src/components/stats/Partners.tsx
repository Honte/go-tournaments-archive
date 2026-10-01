'use client';

import { useMemo } from 'react';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { getTranslator } from '@/i18n/translator';
import { getPartnerRows, type RelatedPlayerRow } from '@/libs/pairStats';
import { SgfCountLink } from '@/components/gameRecords/SgfCountLink';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

export function Partners({
  event,
  player,
  translations,
  category,
}: {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
  category?: string;
}) {
  const t = getTranslator(translations);
  const data = useMemo(() => getPartnerRows(player), [player]);
  const columns: StatsColumnDef<RelatedPlayerRow>[] = [
    {
      accessorKey: 'name',
      header: t('table.partner'),
      meta: { className: 'text-left' },
      cell: ({ row }) => (
        <PlayerCell event={event} locale={translations.locale} player={row.original.participant} showRank={false} />
      ),
    },
    { accessorKey: 'attended', header: t('table.events') },
    ...(['gold', 'silver', 'bronze'] as const).map((key) => ({ accessorKey: key, header: t(`medals.${key}`) })),
    ...(['games', 'won', 'drawn', 'lost', 'unresolved'] as const)
      .filter((key) => !['drawn', 'unresolved'].includes(key) || data.some((row) => row[key] > 0))
      .map((key) => ({ accessorKey: key, header: t(`table.${key}`) })),
    {
      accessorKey: 'sgfs',
      header: t('table.sgfs'),
      enabled: event.generateSgfs && data.some((row) => row.sgfs > 0),
      cell: ({ row }) => (
        <SgfCountLink
          event={event}
          locale={translations.locale}
          count={row.original.sgfs}
          filters={{ player: player.id, partner: row.original.id, category }}
        />
      ),
    },
    {
      accessorKey: 'wonPercent',
      header: t('table.wonPercent'),
      cell: getFormatter(translations.locale).toPercentageCell,
    },
  ];
  return (
    <div>
      <H2>{t('stats.partners')}</H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
