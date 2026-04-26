import type { ApiPlayerStats } from '@/schema/api';
import type { StatsCountry } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import type { NavigationGroup } from '@/data/sitemap';

export function fetchTranslations(locale: Locale) {
  return get<Translations>(`/data/i18n/${locale}.json`);
}

export function fetchPlayerStats(slug: string) {
  return get<ApiPlayerStats>(`/data/stats/player/${slug}.json`);
}

export function fetchCountryStats(code: string) {
  return get<StatsCountry>(`/data/stats/country/${code.toLowerCase()}.json`);
}

export function fetchSitemap(locale: Locale) {
  return get<NavigationGroup[]>(`/data/sitemap/${locale}.json`);
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
