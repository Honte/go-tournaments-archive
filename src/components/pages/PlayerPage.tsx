import type { PlayerStats as Stats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { jsxJoin } from '@/libs/join';
import { PlayerStats } from '@/components/PlayerStats';
import { Achievements } from '@/components/stats/Achievements';
import { Content } from '@/components/ui/Content';
import { CountryLink } from '@/components/ui/CountryLink';
import { Title } from '@/components/ui/Title';

type PlayerPageProps = {
  event: EventContext;
  translations: Translations;
  player: Stats;
};

export function PlayerPage({ event, player, translations }: PlayerPageProps) {
  return (
    <Content>
      <header className="flex flex-col">
        <Title>{player.name}</Title>
        {event.showCountry && player.country && (
          <h2 className="text-xl text-center font-bold">
            {jsxJoin(
              player.country
                .filter(Boolean)
                .map((country) => (
                  <CountryLink event={event} key={country} translations={translations} code={country} full={true} />
                )),
              ', '
            )}
          </h2>
        )}
      </header>

      <Achievements event={event} player={player} translations={translations} />
      <PlayerStats event={event} slug={player.id} locale={translations.locale} />
    </Content>
  );
}
