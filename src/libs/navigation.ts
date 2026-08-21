type NavigationLocation = Pick<URL, 'pathname' | 'searchParams' | 'search' | 'hash'>;
type NavigationState = { location: NavigationLocation | null; target: URL | null };
type NavigationListener = () => void;
type NavigationMethod = 'push' | 'replace';
type NavigationKind = 'history' | 'route' | 'external';

const PREVIOUS_URL_STATE_KEY = '__goTournamentsArchivePreviousUrl';
const NAVIGATION_BASE_PATH = process.env.BASE_PATH ?? '';

const EMPTY_NAVIGATION_STATE: NavigationState = {
  location: null,
  target: null,
};

const SERVER_NAVIGATION_STATE: NavigationState = {
  location: {
    pathname: '',
    search: '',
    hash: '',
    searchParams: new URLSearchParams(),
  },
  target: null,
};

let navigationState = EMPTY_NAVIGATION_STATE;
const listeners = new Set<NavigationListener>();

export function createNavigationUrl(href: string, baseHref: string): URL | null {
  const base = new URL(baseHref);
  const target = new URL(href, base);

  if (target.origin !== base.origin) {
    return null;
  }

  return target;
}

export function getNavigationState() {
  if (!navigationState.location && typeof window !== 'undefined') {
    navigationState = {
      ...navigationState,
      location: readWindowLocation(),
    };
  }

  return navigationState;
}

export function getServerNavigationState() {
  return SERVER_NAVIGATION_STATE;
}

export function subscribeToNavigation(listener: NavigationListener) {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener('popstate', handleHistoryNavigation);
  }

  return () => {
    listeners.delete(listener);

    if (!listeners.size) {
      window.removeEventListener('popstate', handleHistoryNavigation);
    }
  };
}

export function subscribeToNavigationUrl(listener: NavigationListener) {
  let previousUrl = getEffectiveNavigationUrl(getNavigationState());

  return subscribeToNavigation(() => {
    const url = getEffectiveNavigationUrl(getNavigationState());

    if (url !== previousUrl) {
      previousUrl = url;
      listener();
    }
  });
}

export function getNavigationLocation(state: NavigationState, pathname?: string) {
  if (!pathname) {
    return state.target ?? state.location;
  }

  if (state.target && isSameNavigationPathname(state.target.pathname, pathname)) {
    return state.target;
  }

  if (state.location && isSameNavigationPathname(state.location.pathname, pathname)) {
    return state.location;
  }

  return null;
}

function getEffectiveNavigationUrl(state: NavigationState) {
  const location = getNavigationLocation(state);
  return location ? relativeUrl(location) : '';
}

export function getNavigationSearch() {
  return new URLSearchParams(getNavigationLocation(getNavigationState())?.searchParams);
}

export function navigate(href: string, method: NavigationMethod = 'push'): NavigationKind {
  const browserTarget = createNavigationUrl(href, window.location.href);

  if (!browserTarget) {
    return 'external';
  }

  const target = getApplicationNavigationUrl(getBrowserNavigationUrl(browserTarget))!;

  if (!isSameNavigationPathname(target.pathname, readWindowLocation().pathname)) {
    setNavigationState({
      location: getNavigationState().location,
      target,
    });

    return 'route';
  }

  updateHistoryUrl(relativeUrl(getBrowserNavigationUrl(browserTarget)), method);
  return 'history';
}

export function getNavigationPathname(pathname: string, basePath = NAVIGATION_BASE_PATH) {
  if (!basePath || pathname === basePath || pathname.startsWith(`${basePath}/`)) {
    return pathname;
  }

  return pathname === '/' ? basePath : `${basePath}${pathname}`;
}

export function getApplicationNavigationUrl(url: URL | null, basePath = NAVIGATION_BASE_PATH) {
  if (!url) {
    return null;
  }

  const applicationUrl = new URL(url);
  applicationUrl.pathname = getApplicationNavigationPathname(applicationUrl.pathname, basePath);

  return applicationUrl;
}

function getBrowserNavigationUrl(url: URL) {
  const browserUrl = new URL(url);
  browserUrl.pathname = getNavigationPathname(browserUrl.pathname);

  return browserUrl;
}

export function getApplicationNavigationPathname(pathname: string, basePath = NAVIGATION_BASE_PATH) {
  if (!basePath || (pathname !== basePath && !pathname.startsWith(`${basePath}/`))) {
    return pathname;
  }

  const applicationPathname = pathname.slice(basePath.length);

  return applicationPathname || '/';
}

export function navigateBack() {
  window.history.back();
}

export function completeNavigation(expected: URL) {
  if (navigationState.target !== expected) {
    return;
  }

  const correction = getNavigationCorrection(window.location.href, getBrowserNavigationUrl(expected));

  if (correction) {
    window.history.replaceState(window.history.state, '', correction);
  }

  setNavigationState({
    location: readWindowLocation(),
    target: null,
  });
}

export function updateNavigationUrl(params: URLSearchParams, method: NavigationMethod) {
  updateHistoryUrl(searchParamsUrl(params), method);
}

export function canNavigateBackTo(params: URLSearchParams) {
  return window.history.state?.[PREVIOUS_URL_STATE_KEY] === searchParamsUrl(params);
}

function updateHistoryUrl(url: string, method: NavigationMethod) {
  if (method === 'replace') {
    window.history.replaceState(window.history.state, '', url);
  } else {
    window.history.pushState(
      {
        ...window.history.state,
        [PREVIOUS_URL_STATE_KEY]: relativeUrl(new URL(window.location.href)),
      },
      '',
      url
    );
  }

  setNavigationState({
    location: readWindowLocation(),
    target: null,
  });
}

function searchParamsUrl(params: URLSearchParams) {
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
}

export function getNavigationCorrection(currentUrl: string, target: URL) {
  const current = new URL(currentUrl);

  if (!isSameNavigationPathname(current.pathname, target.pathname)) {
    return undefined;
  }

  if (current.search === target.search && current.hash === target.hash) {
    return undefined;
  }

  return relativeUrl(target);
}

export function isSameNavigationPathname(first: string, second: string) {
  return trimTrailingSlashes(first) === trimTrailingSlashes(second);
}

function trimTrailingSlashes(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function relativeUrl(url: Pick<URL, 'pathname' | 'search' | 'hash'>) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function handleHistoryNavigation() {
  setNavigationState({
    location: readWindowLocation(),
    target: null,
  });
}

function readWindowLocation() {
  return getApplicationNavigationUrl(new URL(window.location.href))!;
}

function setNavigationState(state: NavigationState) {
  navigationState = state;

  for (const listener of listeners) {
    listener();
  }
}
