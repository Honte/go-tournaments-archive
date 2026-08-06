import { type StateCreator } from 'zustand/vanilla';
import type { ApiGameInfo } from '@/schema/api';
import { buildGameRecordsModel } from './model';
import {
  DEFAULT_GAME_RECORDS_STATE,
  type GameRecordsModel,
  type GameRecordsOptions,
  type GameRecordsState,
} from './schema';

export type GameRecordsStore = {
  games: readonly ApiGameInfo[];
  options: GameRecordsOptions;
  model: GameRecordsModel;
  expanded: boolean;
  setFilters: (patch: Partial<GameRecordsState>) => void;
  clearFilters: () => void;
  setExpanded: (expanded: boolean) => void;
};

export type GameRecordsStoreConfig = {
  games: readonly ApiGameInfo[];
  options: GameRecordsOptions;
  initialState?: GameRecordsState;
};

export function createGameRecordsStoreState(config: GameRecordsStoreConfig): StateCreator<GameRecordsStore> {
  const initialModel = buildGameRecordsModel(
    config.games,
    config.initialState ?? DEFAULT_GAME_RECORDS_STATE,
    config.options
  );

  return (set, get) => ({
    games: config.games,
    options: config.options,
    model: initialModel,
    expanded: false,

    setFilters: (patch) => {
      const nextModel = buildGameRecordsModel(config.games, { ...get().model.state, ...patch }, config.options);

      set({ model: nextModel });
    },

    clearFilters: () => {
      set({
        model: buildGameRecordsModel(config.games, DEFAULT_GAME_RECORDS_STATE, config.options),
      });
    },

    setExpanded: (expanded) => set({ expanded }),
  });
}
