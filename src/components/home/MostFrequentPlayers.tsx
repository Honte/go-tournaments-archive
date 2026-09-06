import type { PlayerSummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { playerUrl } from '@/libs/urls';
import { AllPlayersStatsLink } from '@/components/home/AllPlayersStatsLink';
import { Link } from '@/components/navigation/Link';
import { H1 } from '@/components/ui/H1';

type MostFrequentPlayersProps = {
  event: EventContext;
  players: PlayerSummary[];
  translations: Translations;
};

export function MostFrequentPlayers({ event, players, translations }: MostFrequentPlayersProps) {
  const t = getTranslator(translations);

  return (
    <div className="flex h-full flex-col">
      <H1 className="mt-0 mb-2 flex min-h-9 items-center">{t('stats.attendants', '10')}</H1>
      <table className="w-full table-fixed">
        <colgroup>
          <col />
          <col className="w-14" />
        </colgroup>
        <thead className="border-b border-archive-border text-xs font-semibold text-archive-text-muted">
          <tr className="h-9">
            <th className="px-1 text-left">{t('table.player')}</th>
            <th className="relative px-1 text-right">
              <span className="absolute top-1/2 right-1 -translate-y-1/2 whitespace-nowrap">{t('table.attended')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {players.slice(0, 10).map((player) => (
            <tr
              key={player.id}
              className="group relative h-9 even:bg-archive-row-stripe-subtle hover:bg-archive-row-hover"
            >
              <td className="px-1 py-1 text-left">
                <Link
                  href={playerUrl(event, translations.locale, player.id)}
                  aria-label={player.name}
                  className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-archive-focus-ring"
                />
                <span className="pointer-events-none relative z-20 group-hover:text-archive-link-hover">
                  {player.name}
                </span>
              </td>
              <td className="px-1 text-right tabular-nums">{player.totalAttended}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-auto">
        <AllPlayersStatsLink event={event} translations={translations} />
      </div>
    </div>
  );
}
