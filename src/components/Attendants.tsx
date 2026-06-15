import type { PlayerSummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStatsLink } from '@/components/AllPlayersStatsLink';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';

type AttendantsProps = {
  event: EventContext;
  players: PlayerSummary[];
  translations: Translations;
};

export function Attendants({ event, players, translations }: AttendantsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1>{t('stats.attendants', '10')}</H1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {players.slice(0, 10).map((p) => (
            <li key={p.id}>
              <PlayerLink event={event} playerId={p.id} locale={translations.locale}>
                {p.name}
              </PlayerLink>{' '}
              - {p.totalAttended}
            </li>
          ))}
        </ol>
      </div>
      <AllPlayersStatsLink event={event} translations={translations} />
    </div>
  );
}
