import type { ApiGameInfo } from '@/schema/api';
import type { PlayerStats, CountryStats } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { Endpoints } from '@/libs/endpoints';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(locale: Locale) {
  return get<Translations>(Endpoints.I18N(locale));
}

export function fetchPlayerStats(slug: string) {
  return get<PlayerStats>(Endpoints.PLAYER_STATS(slug));
}

export function fetchCountryStats(code: string) {
  return get<CountryStats>(Endpoints.COUNTRY_STATS(code));
}

export function fetchSitemap(locale: Locale) {
  return get<NavigationGroup[]>(Endpoints.SITEMAP(locale));
}

export function fetchGames() {
  return get<ApiGameInfo[]>(Endpoints.GAMES_WITH_SGFS());
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
