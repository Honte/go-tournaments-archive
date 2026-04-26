import type { StatsCountry, StatsOpponent, StatsPlayer } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';

export type PlayerStatsData = {
  player: StatsPlayer;
  opponents: StatsOpponent[];
};

export function fetchTranslations(locale: Locale) {
  return get<Translations>(`/data/i18n/${locale}.json`);
}

export function fetchPlayerStats(slug: string) {
  return get<PlayerStatsData>(`/data/stats/player/${slug}.json`);
}

export function fetchCountryStats(code: string) {
  return get<StatsCountry>(`/data/stats/country/${code.toLowerCase()}.json`);
}

async function get<T>(path: string) {
  const response = await fetch(path);

  return (await response.json()) as T;
}
