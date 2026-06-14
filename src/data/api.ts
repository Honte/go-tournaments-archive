import type { ApiGameInfo } from '@/schema/api';
import type { PlayerStats, CountryStats } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { countryStatsDataUrl, gamesWithSgfsUrl, i18nUrl, playerStatsDataUrl, sitemapUrl } from '@/libs/urls';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(basePath: string | undefined, eventPrefix: string | undefined, locale: Locale) {
  return get<Translations>(i18nUrl(basePath, eventPrefix, locale));
}

export function fetchPlayerStats(basePath: string | undefined, eventPrefix: string | undefined, slug: string) {
  return get<PlayerStats>(playerStatsDataUrl(basePath, eventPrefix, slug));
}

export function fetchCountryStats(basePath: string | undefined, eventPrefix: string | undefined, code: string) {
  return get<CountryStats>(countryStatsDataUrl(basePath, eventPrefix, code));
}

export function fetchSitemap(basePath: string | undefined, eventPrefix: string | undefined, locale: Locale) {
  return get<NavigationGroup[]>(sitemapUrl(basePath, eventPrefix, locale));
}

export function fetchGames(basePath?: string, eventPrefix?: string) {
  return get<ApiGameInfo[]>(gamesWithSgfsUrl(basePath, eventPrefix));
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
