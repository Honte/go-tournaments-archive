import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { getAllPlayersStats, getPlayerStats, getTranslations } from '@/data/serverApi';
import { PlayerStats } from '@/components/PlayerStats';
import { Achievements } from '@/components/stats/Achievements';
import { Content } from '@/components/ui/Content';
import { CountryLink } from '@/components/ui/CountryLink';
import { Title } from '@/components/ui/Title';

type PlayerPageProps = {
  event: EventContext;
  locale: Locale;
  slug: string;
};

export async function PlayerPage({ event, locale, slug }: PlayerPageProps) {
  const translations = await getTranslations(event, locale);
  const player = await getPlayerStats(event, slug);

  if (!player) {
    return notFound();
  }

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
      <PlayerStats event={event} slug={player.id} locale={locale} />
    </Content>
  );
}

export async function getPlayerPageMetadata({ event, locale, slug }: PlayerPageProps) {
  const translations = await getTranslations(event, locale);
  const player = await getPlayerStats(event, slug);
  const t = getTranslator(translations);

  return {
    title: player ? `${t('site.playerStatsTitle', player.name ?? '')} - ${t('site.name')}` : t('site.name'),
    description: player ? t('site.playerStatsDescription', player.name ?? '') : t('site.description'),
  };
}

export async function getPlayerPageOptions(event: EventContext) {
  const players = await getAllPlayersStats(event);

  return Object.keys(players)
    .filter((key) => key !== 'BYE')
    .map((slug) =>
      event.locales.map((locale) => ({
        locale,
        slug,
      }))
    )
    .flat();
}
