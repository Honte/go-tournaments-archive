import { notFound } from 'next/navigation';
import type { PlayerStats as PlayerStatsData } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { filterPlayerStatsByCategory, getPlayerAvailableCategories } from '@/libs/playerStats';
import { getAllPlayersStats, getPlayerStats, getTranslations } from '@/data/serverApi';
import { PlayerStats } from '@/components/PlayerStats';
import { Achievements } from '@/components/stats/Achievements';
import { PlayerStatsNavigation } from '@/components/stats/PlayerStatsNavigation';
import { Content } from '@/components/ui/Content';
import { CountryLink } from '@/components/ui/CountryLink';
import { Title } from '@/components/ui/Title';

type PlayerPageProps = {
  event: EventContext;
  locale: Locale;
  slug: string;
  category?: string;
};

export async function PlayerPage({ event, locale, slug, category }: PlayerPageProps) {
  if (category && !event.categories?.includes(category)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const player = await getPlayerStats(event, slug);

  if (!player) {
    return notFound();
  }

  const categories = getPlayerAvailableCategories(player, event.categories ?? []);

  if (category && (categories.length < 2 || !categories.includes(category))) {
    return notFound();
  }

  const statsPlayer = category ? filterPlayerStatsByCategory(player, category) : player;

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

      {categories.length > 0 && (
        <PlayerStatsNavigation
          event={event}
          slug={player.id}
          locale={locale}
          category={category}
          categories={categories}
          translations={translations}
        />
      )}
      <Achievements event={event} player={statsPlayer} translations={translations} />
      <PlayerStats event={event} slug={player.id} locale={locale} category={category} />
    </Content>
  );
}

export async function getPlayerPageMetadata({ event, locale, slug, category }: PlayerPageProps) {
  if (category && !event.categories?.includes(category)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const player = await getPlayerStats(event, slug);

  if (!player) {
    return notFound();
  }

  const t = getTranslator(translations);
  const name = player && category ? `${player.name} - ${t(`categories.full.${category}`)}` : player?.name;

  return {
    title: name ? `${t('site.playerStatsTitle', name)} - ${t('site.name')}` : t('site.name'),
    description: name ? t('site.playerStatsDescription', name) : t('site.description'),
  };
}

export async function getPlayerPageOptions(event: EventContext) {
  if (event.dynamic) {
    return [];
  }

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

export async function getPlayerCategoryPageOptions(event: EventContext) {
  if (event.dynamic) {
    return [];
  }

  const players = await getAllPlayersStats(event);

  return getPlayerCategoryPageOptionsFromStats(event, players);
}

export function getPlayerCategoryPageOptionsFromStats(event: EventContext, players: Record<string, PlayerStatsData>) {
  const pages: { locale: Locale; slug: string; category: string }[] = [];

  for (const player of Object.values(players)) {
    if (player.id === 'BYE') {
      continue;
    }

    const categories = getPlayerAvailableCategories(player, event.categories ?? []);

    if (categories.length < 2) {
      continue;
    }

    for (const category of categories) {
      for (const locale of event.locales) {
        pages.push({
          locale,
          slug: player.id,
          category,
        });
      }
    }
  }

  if (!pages.length) {
    pages.push({
      locale: event.locales[0],
      slug: 'none',
      category: 'none',
    });
  }

  return pages;
}
