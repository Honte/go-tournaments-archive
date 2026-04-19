import type { StatsPlayer } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStatsLink } from '@/components/AllPlayersStatsLink';
import { MedalTable } from '@/components/MedalTable';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from './ui/PlayerName';

type MedalistsProps = {
  players: StatsPlayer[];
  translations: Translations;
};

export function Medalists({ players, translations }: MedalistsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.medalists')}</H1>
      <MedalTable
        translations={translations}
        results={players}
        toKey={(player) => player.id}
        toName={(player) => (
          <PlayerLink playerId={player.id} locale={translations.locale}>
            <PlayerName player={player} includeRank={false} />
          </PlayerLink>
        )}
      />
      <AllPlayersStatsLink translations={translations} />
    </div>
  );
}
