import { createStore, type StoreApi } from 'zustand/vanilla';
import type { ApiGameInfo } from '@/schema/api';
import { deriveGameBrowserModel } from './model';
import {
  DEFAULT_GAME_BROWSER_STATE,
  type GameBrowserModel,
  type GameBrowserOptions,
  type GameBrowserState,
} from './schema';
import { parseGameBrowserState, serializeGameBrowserState } from './urlState';

export type GameRecordsStore = {
  games: readonly ApiGameInfo[];
  options: GameBrowserOptions;
  model: GameBrowserModel;
  expanded: boolean;
  setFilters: (patch: Partial<GameBrowserState>) => void;
  clearFilters: () => void;
  setExpanded: (expanded: boolean) => void;
};

export type GameRecordsStoreApi = StoreApi<GameRecordsStore>;

export type GameRecordsStoreConfig = {
  games: readonly ApiGameInfo[];
  options: GameBrowserOptions;
  initialState: GameBrowserState;
};

export function createGameRecordsStore(config: GameRecordsStoreConfig): GameRecordsStoreApi {
  const initialModel = deriveGameBrowserModel(config.games, config.initialState, config.options);

  return createStore<GameRecordsStore>((set, get) => ({
    games: config.games,
    options: config.options,
    model: initialModel,
    expanded: false,

    setFilters: (patch) => {
      const nextModel = deriveGameBrowserModel(config.games, { ...get().model.state, ...patch }, config.options);

      set({ model: nextModel });
    },

    clearFilters: () => {
      set({
        model: deriveGameBrowserModel(config.games, DEFAULT_GAME_BROWSER_STATE, config.options),
      });
    },

    setExpanded: (expanded) => set({ expanded }),
  }));
}

export function connectGameRecordsUrlState(store: GameRecordsStoreApi) {
  let syncingFromUrl = false;

  const updateFromUrl = () => {
    const current = new URLSearchParams(window.location.search);
    const requestedState = parseGameBrowserState(current);
    const currentStore = store.getState();
    const model = deriveGameBrowserModel(currentStore.games, requestedState, currentStore.options);

    syncingFromUrl = true;
    store.setState({ model });
    syncingFromUrl = false;
  };

  const replaceWithCanonicalUrl = () => {
    const current = new URLSearchParams(window.location.search);
    const canonical = serializeGameBrowserState(store.getState().model.state, current);

    if (canonical.toString() !== current.toString()) {
      updateBrowserUrl(canonical, 'replace');
    }
  };

  const unsubscribe = store.subscribe((state, previous) => {
    if (syncingFromUrl || state.model === previous.model) {
      return;
    }

    const current = new URLSearchParams(window.location.search);
    const next = serializeGameBrowserState(state.model.state, current);

    if (next.toString() !== current.toString()) {
      const scrollTop = window.scrollY;
      updateBrowserUrl(next, 'push');
      preserveWindowScroll(scrollTop);
    }
  });

  window.addEventListener('popstate', updateFromUrl);
  replaceWithCanonicalUrl();

  return () => {
    unsubscribe();
    window.removeEventListener('popstate', updateFromUrl);
  };
}

function updateBrowserUrl(params: URLSearchParams, method: 'push' | 'replace') {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;

  window.history[`${method}State`](null, '', url);
}

function preserveWindowScroll(scrollTop: number) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollTop)));
}
