import type { Translator } from '@/i18n/consts';
import type { GameBrowserState, GameGroup, GameSort } from '@/libs/gameRecords';
import { Button } from '@/components/ui/Button';
import { FacetSelect } from '@/components/ui/FacetSelect';

type Option<T extends string> = { value: T; label: string };

type GameBrowserToolbarProps = {
  activeCount: number;
  disclosureLabel: string;
  expanded: boolean;
  groupOptions: readonly Option<GameGroup>[];
  onClear: () => void;
  onPatch: (values: Partial<GameBrowserState>) => void;
  onToggle: () => void;
  sortOptions: readonly Option<GameSort>[];
  state: GameBrowserState;
  t: Translator;
};

export function GameBrowserToolbar({
  activeCount,
  disclosureLabel,
  expanded,
  groupOptions,
  onClear,
  onPatch,
  onToggle,
  sortOptions,
  state,
  t,
}: GameBrowserToolbarProps) {
  return (
    <>
      <FacetSelect
        id="game-sort"
        label={t('gamesFilter.sort')}
        value={state.sort}
        options={sortOptions.map((option) => ({ ...option, count: 1 }))}
        className="min-w-56 flex-1 sm:max-w-sm"
        onChange={(sort) => sort && onPatch({ sort: sort as GameSort })}
        name="sort"
        showCounts={false}
        searchable={false}
        clearable={false}
      />

      <FacetSelect
        id="game-group"
        label={t('gamesFilter.group')}
        value={state.group}
        options={groupOptions.map((option) => ({ ...option, count: 1 }))}
        className="min-w-56 flex-1 sm:max-w-sm"
        onChange={(group) => group && onPatch({ group: group as GameGroup })}
        name="group"
        showCounts={false}
        searchable={false}
        clearable={false}
      />

      <div className="ml-auto flex items-end">
        <div className="flex items-center gap-2 leading-8">
          <Button
            type="button"
            aria-controls="game-record-filters-advanced"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            {disclosureLabel}
          </Button>
          <Button
            type="button"
            onClick={onClear}
            disabled={!activeCount}
            className="disabled:cursor-default disabled:opacity-50"
          >
            {t('gamesFilter.clear')}
            {activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </div>
      </div>
    </>
  );
}
