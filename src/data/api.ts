import type { ApiPlayerStats } from '@/schema/api';
import type { StatsCountry } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { Endpoints } from '@/libs/endpoints';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(locale: Locale) {
  return get<Translations>(Endpoints.I18N(locale));
}

export function fetchPlayerStats(slug: string) {
  return get<ApiPlayerStats>(Endpoints.PLAYER_STATS(slug));
}

export function fetchCountryStats(code: string) {
  return get<StatsCountry>(Endpoints.COUNTRY_STATS(code));
}

export function fetchSitemap(locale: Locale) {
  return get<NavigationGroup[]>(Endpoints.SITEMAP(locale));
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
