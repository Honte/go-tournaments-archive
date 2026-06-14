import type { TournamentItem } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  allCountryStatsUrl,
  allGameStatsUrl,
  allPlayersStatsUrl,
  categoryUrl,
  homeUrl,
  tournamentUrl,
} from '@/libs/urls';

export type NavigationLink = {
  key: string;
  href: string;
  label: string;
  description?: string;
};

export type NavigationGroup = {
  key: string;
  label?: string;
  links: NavigationLink[];
  indented?: boolean;
};

export function getSitemap(event: EventContext, tournaments: TournamentItem[], translations: Translations) {
  const locale = translations.locale;
  const t = getTranslator(translations);

  const groups: NavigationGroup[] = [];

  const main: NavigationLink[] = [
    {
      key: 'home',
      href: homeUrl(event.prefix, locale),
      label: t('navigation.home.anchor'),
    },
    {
      key: 'stats',
      href: allPlayersStatsUrl(event.prefix, locale),
      label: t('site.allTimeStatsLink'),
    },
  ];

  if (event.showCountry) {
    main.push({
      key: 'countries',
      href: allCountryStatsUrl(event.prefix, locale),
      label: t('site.allTimeStatsByCountryLink'),
    });
  }

  if (tournaments.some((tournament) => tournament.hasSgfs)) {
    main.push({
      key: 'games',
      href: allGameStatsUrl(event.prefix, locale),
      label: t('site.gamesListLink'),
    });
  }

  groups.push({ key: 'main', links: main });

  if (event.categories?.length) {
    groups.push({
      key: 'categories',
      label: t('navigation.categories'),
      indented: true,
      links: event.categories.map((category) => ({
        key: `category-${category}`,
        href: categoryUrl(event.prefix, locale, category),
        label: t(`categories.short.${category}`),
      })),
    });
  }

  if (tournaments.length > 0) {
    groups.push({
      key: 'tournaments',
      label: t('navigation.tournaments'),
      indented: true,
      links: tournaments.toReversed().map((tournament) => {
        const location =
          event.showCountry && tournament.country
            ? `${tournament.location}, ${tournament.country}`
            : tournament.location;

        return {
          key: `tournament-${tournament.year}`,
          href: tournamentUrl(event.prefix, locale, tournament.year),
          label: String(tournament.year),
          description: location,
        };
      }),
    });
  }

  return groups;
}
