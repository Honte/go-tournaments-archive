import { createJSONStorage, persist, type StateStorage, type StorageValue } from 'zustand/middleware';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { deriveGameBrowserModel } from './model';
import { DEFAULT_GAME_BROWSER_STATE, type GameRecordsState } from './schema';
import { createGameRecordsStoreState, type GameRecordsStore, type GameRecordsStoreConfig } from './store';
import { parseGameRecordsState, serializeGameRecordsState } from './urlState';

export type GameRecordsStoreApi = StoreApi<GameRecordsStore> & {
  persist: {
    rehydrate: () => Promise<void> | void;
  };
  listen: () => () => void;
};

export function createGameRecordsStore(config: GameRecordsStoreConfig): GameRecordsStoreApi {
  let store: GameRecordsStoreApi;

  const createdStore = createStore<GameRecordsStore>()(
    persist(createGameRecordsStoreState(config), {
      name: GAME_RECORDS_STORAGE_KEY,
      storage: createJSONStorage<GameRecordsState>(() => gameRecordsUrlStorage),
      partialize: (state) => state.model.state,
      merge: (persistedState, currentState) => ({
        ...currentState,
        model: deriveGameBrowserModel(config.games, persistedState as GameRecordsState, config.options),
      }),
      version: GAME_RECORDS_STORAGE_VERSION,
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          replaceWithCanonicalUrl(store);
        }
      },
    })
  );

  const rehydrateFromUrl = () => void store.persist.rehydrate();
  const listen = () => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    window.addEventListener('popstate', rehydrateFromUrl);

    return () => {
      window.removeEventListener('popstate', rehydrateFromUrl);
    };
  };

  store = Object.assign(createdStore, { listen });

  return store;
}

const GAME_RECORDS_STORAGE_KEY = 'game-records';
const GAME_RECORDS_STORAGE_VERSION = 1;

const gameRecordsUrlStorage: StateStorage = {
  getItem: (_key) => {
    if (typeof window === 'undefined') {
      return null;
    }

    const state = parseGameRecordsState(new URLSearchParams(window.location.search));
    return JSON.stringify({ state, version: GAME_RECORDS_STORAGE_VERSION });
  },

  setItem: (_key, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    const persisted = JSON.parse(value) as StorageValue<GameRecordsState>;
    const current = new URLSearchParams(window.location.search);
    const next = serializeGameRecordsState(persisted.state, current);

    if (next.toString() !== current.toString()) {
      const scrollTop = window.scrollY;
      updateBrowserUrl(next, 'push');
      preserveWindowScroll(scrollTop);
    }
  },

  removeItem: (_key) => {
    if (typeof window === 'undefined') {
      return;
    }

    const current = new URLSearchParams(window.location.search);
    const next = serializeGameRecordsState(DEFAULT_GAME_BROWSER_STATE, current);

    if (next.toString() !== current.toString()) {
      updateBrowserUrl(next, 'replace');
    }
  },
};

function updateBrowserUrl(params: URLSearchParams, method: 'push' | 'replace') {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;

  window.history[`${method}State`](null, '', url);
}

function replaceWithCanonicalUrl(store: GameRecordsStoreApi) {
  if (typeof window === 'undefined') {
    return;
  }

  const current = new URLSearchParams(window.location.search);
  const canonical = serializeGameRecordsState(store.getState().model.state, current);

  if (canonical.toString() !== current.toString()) {
    updateBrowserUrl(canonical, 'replace');
  }
}

function preserveWindowScroll(scrollTop: number) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollTop)));
}
