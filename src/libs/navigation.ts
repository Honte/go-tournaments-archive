type NavigationState = { location: URL | null; target: URL | null };
type NavigationListener = () => void;
type NavigationMethod = 'push' | 'replace';
type NavigationKind = 'history' | 'route' | 'external';

const PREVIOUS_URL_STATE_KEY = '__goTournamentsArchivePreviousUrl';

const EMPTY_NAVIGATION_STATE: NavigationState = {
  location: null,
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
  return EMPTY_NAVIGATION_STATE;
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

  if (state.target?.pathname === pathname) {
    return state.target;
  }

  if (state.location?.pathname === pathname) {
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
  const target = createNavigationUrl(href, window.location.href);

  if (!target) {
    return 'external';
  }

  if (target.pathname !== window.location.pathname) {
    setNavigationState({
      location: getNavigationState().location,
      target,
    });

    return 'route';
  }

  updateHistoryUrl(relativeUrl(target), method);
  return 'history';
}

export function navigateBack() {
  window.history.back();
}

export function completeNavigation(expected: URL) {
  if (navigationState.target !== expected) {
    return;
  }

  const correction = getNavigationCorrection(window.location.href, expected);

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
        [PREVIOUS_URL_STATE_KEY]: relativeUrl(readWindowLocation()),
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

  if (current.pathname !== target.pathname) {
    return undefined;
  }

  if (current.search === target.search && current.hash === target.hash) {
    return undefined;
  }

  return relativeUrl(target);
}

function relativeUrl(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function handleHistoryNavigation() {
  setNavigationState({
    location: readWindowLocation(),
    target: null,
  });
}

function readWindowLocation() {
  return new URL(window.location.href);
}

function setNavigationState(state: NavigationState) {
  navigationState = state;

  for (const listener of listeners) {
    listener();
  }
}
