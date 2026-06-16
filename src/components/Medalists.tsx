import type { PlayerSummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStatsLink } from '@/components/AllPlayersStatsLink';
import { MedalTable } from '@/components/MedalTable';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from './ui/PlayerName';

type MedalistsProps = {
  event: EventContext;
  players: PlayerSummary[];
  translations: Translations;
};

export function Medalists({ event, players, translations }: MedalistsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.medalists')}</H1>
      <MedalTable
        translations={translations}
        results={players}
        toKey={(player) => player.id}
        toName={(player) => (
          <PlayerLink event={event} playerId={player.id} locale={translations.locale}>
            <PlayerName player={player} showRank={false} showCountry={event.showCountry} />
          </PlayerLink>
        )}
      />
      <AllPlayersStatsLink event={event} translations={translations} />
    </div>
  );
}
