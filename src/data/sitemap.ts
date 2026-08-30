import type { TournamentItem } from '@/schema/data';
import type { ArchiveConfiguration, EventContext, EventLinkPlace } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getString } from '@/i18n/utils';
import { isFakeCountry } from '@/libs/country';
import {
  allCountryStatsUrl,
  allGameStatsUrl,
  allPlayersStatsUrl,
  categoryUrl,
  homeUrl,
  multiHomeUrl,
  tournamentUrl,
} from '@/libs/urls';

export type NavigationLink = {
  key: string;
  href: string;
  label: string;
  description?: string;
  tooltip?: string;
};

export type NavigationGroup = {
  key: string;
  label?: string;
  links: NavigationLink[];
  indented?: boolean;
};

export async function buildSitemap(
  event: EventContext,
  tournaments: TournamentItem[],
  translations: Translations,
  otherEvents?: EventContext[]
) {
  const locale = translations.locale;
  const t = getTranslator(translations);

  const groups: NavigationGroup[] = [];
  const links = collectLinks(event, locale);

  if (links.top.length) {
    groups.push(...links.top);
  }

  const main: NavigationLink[] = [
    {
      key: 'home',
      href: homeUrl(event, locale),
      label: t('navigation.home.anchor'),
    },
    {
      key: 'stats',
      href: allPlayersStatsUrl(event, locale),
      label: t('site.allTimeStatsLink'),
    },
  ];

  if (otherEvents?.length) {
    main.unshift({
      key: 'multi-home',
      href: multiHomeUrl(locale),
      label: t('navigation.allEvents'),
    });
  }

  if (event.showCountry) {
    main.push({
      key: 'countries',
      href: allCountryStatsUrl(event, locale),
      label: t('site.allTimeStatsByCountryLink'),
    });
  }

  if (tournaments.some((tournament) => tournament.hasSgfs)) {
    main.push({
      key: 'games',
      href: allGameStatsUrl(event, locale),
      label: t('site.gamesListLink'),
    });
  }

  groups.push({ key: 'main', links: main });

  if (links.middle.length) {
    groups.push(...links.middle);
  }

  if (event.categories?.length) {
    groups.push({
      key: 'categories',
      label: t('navigation.categories'),
      indented: true,
      links: event.categories.map((category) => ({
        key: `category-${category}`,
        href: categoryUrl(event, locale, category),
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
          event.showCountry && tournament.country && !isFakeCountry(tournament.country)
            ? `${tournament.location}, ${tournament.country}`
            : tournament.location;

        return {
          key: `tournament-${tournament.year}`,
          href: tournamentUrl(event, locale, tournament.year),
          label: String(tournament.year),
          description: location,
        };
      }),
    });
  }

  if (links.bottom.length) {
    groups.push(...links.bottom);
  }

  if (otherEvents?.length) {
    groups.push({
      key: 'other-events',
      label: t('navigation.otherEvents'),
      links: await collectOtherEventLinks(otherEvents, locale),
      indented: true,
    });
  }

  return groups;
}

function collectLinks(event: EventContext, locale: Locale) {
  const result: Record<EventLinkPlace, NavigationGroup[]> = {
    top: [],
    middle: [],
    bottom: [],
  };

  if (!event.links) {
    return result;
  }

  const defaults: Partial<Record<EventLinkPlace, NavigationGroup>> = {};
  for (const linkEntry of event.links) {
    if ('links' in linkEntry) {
      const target = result[linkEntry.place ?? 'bottom'];
      const groupLabel = getString(linkEntry.title, locale);

      if (!groupLabel) {
        continue;
      }

      const links: NavigationLink[] = [];
      for (const linkChild of linkEntry.links) {
        const href = getString(linkChild.website, locale);
        const label = getString(linkChild.title, locale, href);

        if (!href || !label) {
          continue;
        }

        links.push({
          key: href,
          href,
          label,
          tooltip: getString(linkChild.tooltip, locale),
          description: getString(linkChild.description, locale),
        });
      }

      if (!links.length) {
        continue;
      }

      target.push({
        key: groupLabel,
        label: groupLabel,
        links,
        indented: true,
      });
    } else {
      const href = getString(linkEntry.website, locale);
      const label = getString(linkEntry.title, locale, href);

      if (!href || !label) {
        continue;
      }

      const place = linkEntry.place ?? 'bottom';
      let target = defaults[place];

      if (!target) {
        target = {
          key: place,
          links: [],
          indented: false,
        };
        result[place].push(target);
        defaults[place] = target;
      }

      target.links.push({
        key: href,
        href,
        label,
        tooltip: getString(linkEntry.tooltip, locale),
        description: getString(linkEntry.description, locale),
      });
    }
  }

  return result;
}

async function collectOtherEventLinks(events: EventContext[], locale: Locale) {
  return Promise.all(
    events.map(async (event) => {
      const eventLocale = isEventLocale(event, locale) ? locale : event.locales[0];
      const translations = await loadTranslations(event, eventLocale);
      const t = getTranslator(translations);

      return {
        key: `event-${event.id}`,
        href: homeUrl(event, eventLocale),
        label: t('site.acronym'),
        description: t('site.name'),
      };
    })
  );
}

export function collectOtherEvents(
  events: EventContext[],
  currentEventId: string,
  crossLinks?: ArchiveConfiguration['crossLinks']
) {
  return crossLinks
    ? events.filter((event) => event.prefix !== currentEventId && (crossLinks === 'internal' ? !event.external : true))
    : [];
}
