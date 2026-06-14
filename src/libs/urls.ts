import { normalizeBasePath } from '@/libs/basePath';

export function faviconUrl(basePath?: string) {
  return withBasePath(basePath, '/favicon.svg');
}

export function appleIconUrl(basePath?: string) {
  return withBasePath(basePath, '/apple-icon.png');
}

export function logoBlackUrl(basePath?: string) {
  return withBasePath(basePath, '/logo-black.svg');
}

export function logoWhiteUrl(basePath?: string) {
  return withBasePath(basePath, '/logo-white.svg');
}

export function i18nUrl(basePath: string | undefined, locale: string) {
  return withBasePath(basePath, `/data/i18n/${locale}.json`);
}

export function playerStatsUrl(basePath: string | undefined, slug: string) {
  return withBasePath(basePath, `/data/stats/player/${slug}.json`);
}

export function countryStatsUrl(basePath: string | undefined, code: string) {
  return withBasePath(basePath, `/data/stats/country/${code.toLowerCase()}.json`);
}

export function gamesWithSgfsUrl(basePath?: string) {
  return withBasePath(basePath, '/sgf/list.json');
}

export function gamesZipUrl(basePath: string | undefined, year: number | string) {
  return withBasePath(basePath, `/sgf/${year}.zip`);
}

export function sitemapUrl(basePath: string | undefined, locale: string) {
  return withBasePath(basePath, `/data/sitemap/${locale}.json`);
}

export function gameSgfUrl(basePath: string | undefined, path: string) {
  return withBasePath(basePath, path);
}

export function rawGameSgfUrl(basePath: string | undefined, path: string) {
  return withBasePath(basePath, path.replace(/\.sgf$/, '.raw.sgf'));
}

export function gameThumbUrl(basePath: string | undefined, path?: string) {
  return path ? withBasePath(basePath, path) : undefined;
}

function withBasePath(basePath: string | undefined, path: string) {
  const normalizedBasePath = normalizeBasePath(basePath);

  if (!normalizedBasePath || !path.startsWith('/') || isExternalPath(path)) {
    return path;
  }

  if (path === normalizedBasePath || path.startsWith(`${normalizedBasePath}/`)) {
    return path;
  }

  return `${normalizedBasePath}${path}`;
}

function isExternalPath(path: string) {
  return path.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(path);
}
