import type { StatsPlayer } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStatsLink } from '@/components/AllPlayersStatsLink';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';

type AttendantsProps = {
  players: StatsPlayer[];
  translations: Translations;
};

export function Attendants({ players, translations }: AttendantsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1>{t('stats.attendants', '10')}</H1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {players.slice(0, 10).map((p) => (
            <li key={p.id}>
              <PlayerLink playerId={p.id} locale={translations.locale}>
                {p.name}
              </PlayerLink>{' '}
              - {p.years.length}
            </li>
          ))}
        </ol>
      </div>
      <AllPlayersStatsLink translations={translations} />
    </div>
  );
}
