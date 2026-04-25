import EVENT_CONFIG from '@event/config';
import type { TournamentItem } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

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

export function getSitemap(tournaments: TournamentItem[], translations: Translations) {
  const locale = translations.locale;
  const t = getTranslator(translations);

  const groups: NavigationGroup[] = [];

  const main: NavigationLink[] = [
    {
      key: 'home',
      href: `/${locale}`,
      label: t('navigation.home.anchor'),
    },
    {
      key: 'stats',
      href: `/${locale}/stats`,
      label: t('site.allTimeStatsLink'),
    },
  ];

  if (EVENT_CONFIG.showCountry) {
    main.push({
      key: 'countries',
      href: `/${locale}/stats/country`,
      label: t('site.allTimeStatsByCountryLink'),
    });
  }

  groups.push({ key: 'main', links: main });

  if (EVENT_CONFIG.categories?.length) {
    groups.push({
      key: 'categories',
      label: t('navigation.categories'),
      indented: true,
      links: EVENT_CONFIG.categories.map((category) => ({
        key: `category-${category}`,
        href: `/${locale}/category/${category}`,
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
          EVENT_CONFIG.showCountry && tournament.country
            ? `${tournament.location}, ${tournament.country}`
            : tournament.location;

        return {
          key: `tournament-${tournament.year}`,
          href: `/${locale}/${tournament.year}`,
          label: String(tournament.year),
          description: location,
        };
      }),
    });
  }

  return groups;
}
