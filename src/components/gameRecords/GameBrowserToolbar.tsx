'use client';

import { clsx } from 'clsx';
import { useStore } from 'zustand';
import type { Translator } from '@/i18n/consts';
import { DEFAULT_GAME_BROWSER_STATE, type GameRecordsStoreApi, getActiveGameFilterCount } from '@/libs/gameRecords';
import { Button } from '@/components/ui/Button';

type GameBrowserToolbarProps = {
  store: GameRecordsStoreApi;
  t: Translator;
  className?: string;
};

export function GameBrowserToolbar({ store, className, t }: GameBrowserToolbarProps) {
  const clearFilters = useStore(store, (storeState) => storeState.clearFilters);
  const expanded = useStore(store, (storeState) => storeState.expanded);
  const setExpanded = useStore(store, (storeState) => storeState.setExpanded);
  const state = useStore(store, (storeState) => storeState.model.state);
  const activeCount = getActiveGameFilterCount(state);

  const hiddenFilterCount =
    activeCount -
    [
      state.player,
      state.sort !== DEFAULT_GAME_BROWSER_STATE.sort,
      state.group !== DEFAULT_GAME_BROWSER_STATE.group,
    ].filter(Boolean).length;

  const disclosureLabel = `${t(expanded ? 'gamesFilter.showLess' : 'gamesFilter.showMore')}${
    !expanded && hiddenFilterCount > 0 ? ` (${hiddenFilterCount})` : ''
  }`;

  return (
    <div className={clsx(className, 'ml-auto flex items-end ')}>
      <div className="flex items-center gap-2 leading-8">
        <Button
          type="button"
          aria-controls="game-record-filters-advanced"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {disclosureLabel}
        </Button>
        <Button
          type="button"
          onClick={clearFilters}
          disabled={!activeCount}
          className="disabled:cursor-default disabled:opacity-50"
        >
          {t('gamesFilter.clear')}
          {activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      </div>
    </div>
  );
}
