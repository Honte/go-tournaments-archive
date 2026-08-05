import { type StateCreator } from 'zustand/vanilla';
import type { ApiGameInfo } from '@/schema/api';
import { deriveGameBrowserModel } from './model';
import {
  DEFAULT_GAME_BROWSER_STATE,
  type GameBrowserModel,
  type GameBrowserOptions,
  type GameRecordsState,
} from './schema';

export type GameRecordsStore = {
  games: readonly ApiGameInfo[];
  options: GameBrowserOptions;
  model: GameBrowserModel;
  expanded: boolean;
  setFilters: (patch: Partial<GameRecordsState>) => void;
  clearFilters: () => void;
  setExpanded: (expanded: boolean) => void;
};

export type GameRecordsStoreConfig = {
  games: readonly ApiGameInfo[];
  options: GameBrowserOptions;
  initialState?: GameRecordsState;
};

export function createGameRecordsStoreState(config: GameRecordsStoreConfig): StateCreator<GameRecordsStore> {
  const initialModel = deriveGameBrowserModel(
    config.games,
    config.initialState ?? DEFAULT_GAME_BROWSER_STATE,
    config.options
  );

  return (set, get) => ({
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
  });
}
