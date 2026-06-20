import type { EventContext } from '@/schema/event';

export function homeUrl(event: EventContext, locale: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}`);
}

export function tournamentUrl(event: EventContext, locale: string, year: number | string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/${year}`);
}

export function categoryUrl(event: EventContext, locale: string, category: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/category/${category}`);
}

export function playerUrl(event: EventContext, locale: string, playerId: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/stats/${playerId}`);
}

export function countryUrl(event: EventContext, locale: string, code: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/stats/country/${code.toLowerCase()}`);
}

export function allPlayersStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/stats`);
}

export function allCountryStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/stats/country`);
}

export function allGameStatsUrl(event: EventContext, locale: string) {
  return joinPaths(event.withPrefix ? event.id : '', `/${locale}/stats/games`);
}

export function faviconUrl(event: EventContext) {
  return joinPaths(event.basePath, event.withPrefix ? event.id : '', '/favicon.svg');
}

export function appleIconUrl(event: EventContext) {
  return joinPaths(event.basePath, event.withPrefix ? event.id : '', '/apple-icon.png');
}

export function logoBlackUrl(event: EventContext) {
  return joinPaths(event.basePath, event.withPrefix ? event.id : '', '/logo-black.svg');
}

export function logoWhiteUrl(event: EventContext) {
  return joinPaths(event.basePath, event.withPrefix ? event.id : '', '/logo-white.svg');
}

export function i18nUrl(event: EventContext, locale: string) {
  return joinPaths(event.basePath, 'data', event.withPrefix ? event.id : '', `i18n/${locale}.json`);
}

export function playerStatsDataUrl(event: EventContext, slug: string) {
  return joinPaths(event.basePath, 'data', event.withPrefix ? event.id : '', `stats/player/${slug}.json`);
}

export function countryStatsDataUrl(event: EventContext, code: string) {
  return joinPaths(
    event.basePath,
    'data',
    event.withPrefix ? event.id : '',
    `stats/country/${code.toLowerCase()}.json`
  );
}

export function tournamentDataUrl(basePath: string | undefined, event: EventContext, year: number | string) {
  return joinPaths(basePath, 'data', event.withPrefix ? event.id : '', `${year}.json`);
}

export function gamesWithSgfsUrl(event: EventContext) {
  return joinPaths(event.basePath, 'sgf', event.withPrefix ? event.id : '', 'list.json');
}

export function gamesZipUrl(event: EventContext, year: number | string) {
  return joinPaths(event.basePath, 'sgf', event.withPrefix ? event.id : '', `${year}.zip`);
}

export function sitemapUrl(event: EventContext, locale: string) {
  return joinPaths(event.basePath, 'data', event.withPrefix ? event.id : '', `sitemap/${locale}.json`);
}

export function gameSgfUrl(event: EventContext, path: string) {
  return joinPaths(event.basePath, 'sgf', event.withPrefix ? event.id : '', path);
}

export function rawGameSgfUrl(event: EventContext, path: string) {
  return joinPaths(event.basePath, 'sgf', event.withPrefix ? event.id : '', path.replace(/\.sgf$/, '.raw.sgf'));
}

export function gameThumbUrl(event: EventContext, path?: string) {
  return path ? joinPaths(event.basePath, 'sgf', event.withPrefix ? event.id : '', path) : undefined;
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
