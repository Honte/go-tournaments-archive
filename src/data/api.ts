import type { ApiGameInfo } from '@/schema/api';
import type { PlayerStats, CountryStats } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { countryStatsUrl, gamesWithSgfsUrl, i18nUrl, playerStatsUrl, sitemapUrl } from '@/libs/urls';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(basePath: string | undefined, locale: Locale) {
  return get<Translations>(i18nUrl(basePath, locale));
}

export function fetchPlayerStats(basePath: string | undefined, slug: string) {
  return get<PlayerStats>(playerStatsUrl(basePath, slug));
}

export function fetchCountryStats(basePath: string | undefined, code: string) {
  return get<CountryStats>(countryStatsUrl(basePath, code));
}

export function fetchSitemap(basePath: string | undefined, locale: Locale) {
  return get<NavigationGroup[]>(sitemapUrl(basePath, locale));
}

export function fetchGames(basePath?: string) {
  return get<ApiGameInfo[]>(gamesWithSgfsUrl(basePath));
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
