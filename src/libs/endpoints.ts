import { NORMALIZED_BASE_PATH } from '@/basePath';

export const Endpoints = createEndpoints(NORMALIZED_BASE_PATH);

export function createEndpoints(basePath: string) {
  function withBasePath(path: string) {
    if (!basePath || !path.startsWith('/') || isExternalPath(path)) {
      return path;
    }

    if (path === basePath || path.startsWith(`${basePath}/`)) {
      return path;
    }

    return `${basePath}${path}`;
  }

  return {
    FAVICON: () => withBasePath('/favicon.svg'),
    APPLE_ICON: () => withBasePath('/apple-icon.png'),
    LOGO_BLACK: () => withBasePath('/logo-black.svg'),
    LOGO_WHITE: () => withBasePath('/logo-white.svg'),

    I18N: (locale: string) => withBasePath(`/data/i18n/${locale}.json`),
    PLAYER_STATS: (slug: string) => withBasePath(`/data/stats/player/${slug}.json`),
    COUNTRY_STATS: (code: string) => withBasePath(`/data/stats/country/${code.toLowerCase()}.json`),
    GAMES_WITH_SGFS: () => withBasePath('/sgf/list.json'),
    GAMES_ZIP: (year: number | string) => withBasePath(`/sgf/${year}.zip`),
    SITEMAP: (locale: string) => withBasePath(`/data/sitemap/${locale}.json`),

    GAME_SGF: (path: string) => withBasePath(path),
    GAME_RAW_SGF: (path: string) => withBasePath(path.replace(/\.sgf$/, '.raw.sgf')),
    GAME_THUMB: (path: string | undefined) => (path ? withBasePath(path) : undefined),
  } as const;
}

function isExternalPath(path: string) {
  return path.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(path);
}
