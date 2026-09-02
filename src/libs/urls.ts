import type { EventContext } from '@/schema/event';

export function multiHomeUrl(locale?: string) {
  return locale ? `/?locale=${locale}` : '/';
}

export function homeUrl(event: EventContext, locale: string) {
  if (event.external && event.domain) {
    return `${event.domain}/${locale}`;
  }

  return joinPaths(event.prefix, `/${locale}`);
}

export function tournamentUrl(event: EventContext, locale: string, year: number | string) {
  return joinPaths(event.prefix, `/${locale}/${year}`);
}

export function categoryUrl(event: EventContext, locale: string, category: string) {
  return joinPaths(event.prefix, `/${locale}/category/${category}`);
}

export function playerUrl(event: EventContext, locale: string, playerId: string, category?: string) {
  return joinPaths(event.prefix, `/${locale}/stats/${playerId}`, category);
}

export function countryUrl(event: EventContext, locale: string, code: string, category?: string) {
  return joinPaths(event.prefix, `/${locale}/stats/country/${code.toLowerCase()}`, category);
}

export function allPlayersStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.prefix, `/${locale}/stats`);
}

export function allCountryStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.prefix, `/${locale}/stats/country`);
}

export function allGameStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.prefix, `/${locale}/stats/games`);
}

export function allGameStatsForPlayerUrl(event: EventContext, locale: string, playerId: string) {
  return `${allGameStatsUrl(event, locale)}?player=${encodeURIComponent(playerId)}`;
}

export function allGameStatsForCountryUrl(event: EventContext, locale: string, country: string) {
  return `${allGameStatsUrl(event, locale)}?country=${encodeURIComponent(country)}`;
}

export function faviconUrl(event: EventContext) {
  return joinPaths(event.basePath, event.prefix, '/event-icon.svg');
}

export function appleIconUrl(event: EventContext) {
  return joinPaths(event.basePath, event.prefix, '/event-icon.png');
}

export function logoBlackUrl(event: EventContext) {
  return joinPaths(event.basePath, event.prefix, '/logo-black.svg');
}

export function logoWhiteUrl(event: EventContext) {
  return joinPaths(event.basePath, event.prefix, '/logo-white.svg');
}

export function i18nUrl(event: EventContext, locale: string) {
  return joinPaths(event.basePath, 'data', event.prefix, `i18n/${locale}.json`);
}

export function playerStatsDataUrl(event: EventContext, slug: string) {
  return joinPaths(event.basePath, 'data', event.prefix, `stats/player/${slug}.json`);
}

export function countryStatsDataUrl(event: EventContext, code: string) {
  return joinPaths(event.basePath, 'data', event.prefix, `stats/country/${code.toLowerCase()}.json`);
}

export function tournamentDataUrl(basePath: string | undefined, event: EventContext, year: number | string) {
  return joinPaths(basePath, 'data', event.prefix, `${year}.json`);
}

export function gamesWithSgfsUrl(event: EventContext) {
  return joinPaths(event.basePath, 'sgf', event.prefix, 'list.json');
}

export function gamesZipUrl(event: EventContext, year: number | string) {
  return joinPaths(event.basePath, 'sgf', event.prefix, `${year}.zip`);
}

export function sitemapUrl(event: EventContext, locale: string) {
  return joinPaths(event.basePath, 'data', event.prefix, `sitemap/${locale}.json`);
}

export function searchIndexUrl(event: EventContext, locale: string) {
  return joinPaths(event.basePath, 'data', event.prefix, `search/${locale}.json`);
}

export function gameSgfUrl(event: EventContext, path: string) {
  return joinPaths(event.basePath, 'sgf', event.prefix, path);
}

export function rawGameSgfUrl(event: EventContext, path: string) {
  return joinPaths(event.basePath, 'sgf', event.prefix, path.replace(/\.sgf$/, '.raw.sgf'));
}

export function gameThumbUrl(event: EventContext, path?: string) {
  return path ? joinPaths(event.basePath, 'sgf', event.prefix, path) : undefined;
}

export function joinPaths(...paths: (string | undefined)[]) {
  let result = '';

  for (const path of paths) {
    if (!path || path === '/') {
      continue;
    }

    result += normalizePath(path);
  }

  return result;
}

export function normalizeBasePath(basePath?: string) {
  if (!basePath || basePath === '/') {
    return '';
  }

  return normalizePath(basePath);
}

function normalizePath(path: string) {
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}
