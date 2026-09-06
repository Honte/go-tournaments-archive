import type { ApiGameInfo } from '@/schema/api';
import type { CountryStats, PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { SearchIndex } from '@/schema/search';
import type { Locale, Translations } from '@/i18n/consts';
import {
  countryStatsDataUrl,
  gamesWithSgfsUrl,
  i18nUrl,
  playerStatsDataUrl,
  searchIndexUrl,
  sitemapUrl,
} from '@/libs/urls';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(event: EventContext, locale: Locale) {
  return get<Translations>(i18nUrl(event, locale));
}

export function fetchPlayerStats(event: EventContext, slug: string) {
  return get<PlayerStats>(playerStatsDataUrl(event, slug));
}

export function fetchCountryStats(event: EventContext, code: string) {
  return get<CountryStats>(countryStatsDataUrl(event, code));
}

export function fetchSitemap(event: EventContext, locale: Locale) {
  return get<NavigationGroup[]>(sitemapUrl(event, locale));
}

export function fetchGames(event: EventContext) {
  return get<ApiGameInfo[]>(gamesWithSgfsUrl(event));
}

export function fetchSearchIndex(event: EventContext, locale: Locale) {
  return get<SearchIndex>(searchIndexUrl(event, locale));
}

async function get<T>(path: string) {
  const response = await fetch(`${path}${path.includes('?') ? '&' : '?'}v=${process.env.VERSION}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${path}`);
  }

  return (await response.json()) as T;
}
