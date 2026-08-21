import type { ApiGameInfo } from '@/schema/api';
import type { CountryStats, PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { countryStatsDataUrl, gamesWithSgfsUrl, i18nUrl, playerStatsDataUrl, sitemapUrl } from '@/libs/urls';
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

async function get<T>(path: string) {
  const response = await fetch(`${path}${path.includes('?') ? '&' : '?'}v=${process.env.VERSION}`);

  return (await response.json()) as T;
}
