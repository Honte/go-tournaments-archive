export function homeUrl(eventPrefix: string | undefined, locale: string) {
  return joinPaths(eventPrefix, `/${locale}`);
}

export function tournamentUrl(eventPrefix: string | undefined, locale: string, year: number | string) {
  return joinPaths(eventPrefix, `/${locale}/${year}`);
}

export function categoryUrl(eventPrefix: string | undefined, locale: string, category: string) {
  return joinPaths(eventPrefix, `/${locale}/category/${category}`);
}

export function playerUrl(eventPrefix: string | undefined, locale: string, playerId: string) {
  return joinPaths(eventPrefix, `/${locale}/stats/${playerId}`);
}

export function countryUrl(eventPrefix: string | undefined, locale: string, code: string) {
  return joinPaths(eventPrefix, `/${locale}/stats/country/${code.toLowerCase()}`);
}

export function allPlayersStatsUrl(eventPrefix: string | undefined, locale: string) {
  return joinPaths(eventPrefix, `/${locale}/stats`);
}

export function allCountryStatsUrl(eventPrefix: string | undefined, locale: string) {
  return joinPaths(eventPrefix, `/${locale}/stats/country`);
}

export function allGameStatsUrl(eventPrefix: string | undefined, locale: string) {
  return joinPaths(eventPrefix, `/${locale}/stats/games`);
}

export function faviconUrl(basePath: string | undefined, eventPrefix: string | undefined) {
  return joinPaths(basePath, eventPrefix, '/favicon.svg');
}

export function appleIconUrl(basePath: string | undefined, eventPrefix: string | undefined) {
  return joinPaths(basePath, eventPrefix, '/apple-icon.png');
}

export function logoBlackUrl(basePath: string | undefined, eventPrefix: string | undefined) {
  return joinPaths(basePath, eventPrefix, '/logo-black.svg');
}

export function logoWhiteUrl(basePath: string | undefined, eventPrefix: string | undefined) {
  return joinPaths(basePath, eventPrefix, '/logo-white.svg');
}

export function i18nUrl(basePath: string | undefined, eventPrefix: string | undefined, locale: string) {
  return joinPaths(basePath, 'data', eventPrefix, `i18n/${locale}.json`);
}

export function playerStatsDataUrl(basePath: string | undefined, eventPrefix: string | undefined, slug: string) {
  return joinPaths(basePath, 'data', eventPrefix, `stats/player/${slug}.json`);
}

export function countryStatsDataUrl(basePath: string | undefined, eventPrefix: string | undefined, code: string) {
  return joinPaths(basePath, 'data', eventPrefix, `stats/country/${code.toLowerCase()}.json`);
}

export function tournamentDataUrl(
  basePath: string | undefined,
  eventPrefix: string | undefined,
  year: number | string
) {
  return joinPaths(basePath, 'data', eventPrefix, `${year}.json`);
}

export function gamesWithSgfsUrl(basePath: string | undefined, eventPrefix: string | undefined) {
  return joinPaths(basePath, 'sgf', eventPrefix, 'list.json');
}

export function gamesZipUrl(basePath: string | undefined, eventPrefix: string | undefined, year: number | string) {
  return joinPaths(basePath, 'sgf', eventPrefix, `${year}.zip`);
}

export function sitemapUrl(basePath: string | undefined, eventPrefix: string | undefined, locale: string) {
  return joinPaths(basePath, 'data', eventPrefix, `sitemap/${locale}.json`);
}

export function gameSgfUrl(basePath: string | undefined, eventPrefix: string | undefined, path: string) {
  return joinPaths(basePath, 'sgf', eventPrefix, path);
}

export function rawGameSgfUrl(basePath: string | undefined, eventPrefix: string | undefined, path: string) {
  return joinPaths(basePath, 'sgf', eventPrefix, path.replace(/\.sgf$/, '.raw.sgf'));
}

export function gameThumbUrl(basePath: string | undefined, eventPrefix: string | undefined, path?: string) {
  return path ? joinPaths(basePath, 'sgf', eventPrefix, path) : undefined;
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
