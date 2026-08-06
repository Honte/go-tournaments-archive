import { persist, type StorageValue } from 'zustand/middleware';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { getNavigationSearch, subscribeToNavigationUrl, updateNavigationUrl } from '@/libs/navigation';
import { buildGameRecordsModel } from './model';
import { DEFAULT_GAME_RECORDS_STATE, type GameRecordsState } from './schema';
import { createGameRecordsStoreState, type GameRecordsStore, type GameRecordsStoreConfig } from './store';
import { parseGameRecordsState, serializeGameRecordsState } from './urlState';

export type GameRecordsStoreApi = StoreApi<GameRecordsStore> & {
  persist: {
    rehydrate: () => Promise<void> | void;
  };
  listen: () => () => void;
};

const GAME_RECORDS_STORAGE_KEY = 'game-records';
const GAME_RECORDS_STORAGE_VERSION = 1;

export function createGameRecordsStore(config: GameRecordsStoreConfig): GameRecordsStoreApi {
  let store: GameRecordsStoreApi;

  const createdStore = createStore<GameRecordsStore>()(
    persist(createGameRecordsStoreState(config), {
      name: GAME_RECORDS_STORAGE_KEY,
      storage: {
        getItem(_key) {
          if (typeof window === 'undefined') {
            return null;
          }

          const state = parseGameRecordsState(getNavigationSearch());

          return { state, version: GAME_RECORDS_STORAGE_VERSION };
        },
        setItem(_key, persisted: StorageValue<GameRecordsState>) {
          if (typeof window === 'undefined') {
            return;
          }

          const current = getNavigationSearch();
          const next = serializeGameRecordsState(persisted.state, current);

          if (next.toString() !== current.toString()) {
            const scrollTop = window.scrollY;
            updateNavigationUrl(next, 'push');
            preserveWindowScroll(scrollTop);
          }
        },
        removeItem(_key) {
          if (typeof window === 'undefined') {
            return;
          }

          const current = getNavigationSearch();
          const next = serializeGameRecordsState(DEFAULT_GAME_RECORDS_STATE, current);

          if (next.toString() !== current.toString()) {
            updateNavigationUrl(next, 'replace');
          }
        },
      },
      partialize: (state) => state.model.state,
      merge: (persistedState, currentState) => ({
        ...currentState,
        model: buildGameRecordsModel(config.games, persistedState as GameRecordsState, config.options),
      }),
      version: GAME_RECORDS_STORAGE_VERSION,
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          replaceWithCanonicalUrl(store);
        }
      },
    })
  );

  store = Object.assign(createdStore, { listen });

  return store;

  function listen() {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    return subscribeToNavigationUrl(rehydrateFromUrl);

    function rehydrateFromUrl() {
      store.persist.rehydrate();
    }
  }
}

function replaceWithCanonicalUrl(store: GameRecordsStoreApi) {
  if (typeof window === 'undefined') {
    return;
  }

  const current = getNavigationSearch();
  const canonical = serializeGameRecordsState(store.getState().model.state, current);

  if (canonical.toString() !== current.toString()) {
    updateNavigationUrl(canonical, 'replace');
  }
}

function preserveWindowScroll(scrollTop: number) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollTop)));
}
