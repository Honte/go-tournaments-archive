'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameRecordCard } from '@/components/gameRecords/GameRecordCard';
import { useResponsiveColumnCount } from '@/hooks/useResponsiveColumnCount';
import { useScrollMargin } from '@/hooks/useScrollMargin';

export type GameRecordGroup = {
  key: string;
  label?: string;
  games: ApiGameInfo[];
};

export type VirtualGameRecordGridProps = {
  event: EventContext;
  groups: readonly GameRecordGroup[];
  translations: Translations;
};

type VirtualRow =
  | { type: 'heading'; key: string; groupKey: string; label: string; collapsed: boolean }
  | { type: 'games'; key: string; games: ApiGameInfo[] };

const ROW_GAP = 16;

export function VirtualGameRecordGrid({ event, groups, translations }: VirtualGameRecordGridProps) {
  const t = getTranslator(translations);
  const listRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveColumnCount();
  const [collapsedGroups, setCollapsedGroups] = useState<ReadonlySet<string>>(() => new Set());
  const rows = useMemo(() => packRows(groups, columnCount, collapsedGroups), [collapsedGroups, columnCount, groups]);
  const scrollMargin = useScrollMargin(listRef, rows.length);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => (rows[index]?.type === 'heading' ? 48 : 350),
    gap: ROW_GAP,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 4,
    scrollMargin,
  });

  // prevents the page from being programmatically scrolled when a virtual row’s measured height differs from its estimate.
  // oxlint-disable-next-line react/immutability -- TanStack Virtual exposes this behavior only as a writable instance callback.
  rowVirtualizer.shouldAdjustScrollPositionOnItemSizeChange = () => false;

  useLayoutEffect(() => {
    rowVirtualizer.measure();
  }, [columnCount, rowVirtualizer]);

  return (
    <div
      ref={listRef}
      role="list"
      aria-label={t('site.gamesListTitle')}
      className="relative w-full"
      style={{ height: rowVirtualizer.getTotalSize() }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];

        if (!row) {
          return null;
        }

        return (
          <div
            key={virtualRow.key}
            ref={rowVirtualizer.measureElement}
            data-index={virtualRow.index}
            className="absolute left-0 top-0 w-full"
            style={{ transform: `translateY(${virtualRow.start - scrollMargin}px)` }}
          >
            {row.type === 'heading' ? (
              <h2>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 border-b border-archive-border-strong pb-1 text-left text-lg font-bold hover:text-archive-link-hover focus-visible:ring-2 focus-visible:ring-archive-focus-ring"
                  aria-expanded={!row.collapsed}
                  onClick={() =>
                    setCollapsedGroups((current) => {
                      const next = new Set(current);

                      if (next.has(row.groupKey)) {
                        next.delete(row.groupKey);
                      } else {
                        next.add(row.groupKey);
                      }

                      return next;
                    })
                  }
                >
                  <FaChevronRight
                    aria-hidden={true}
                    className={`shrink-0 transition-transform duration-200 ${row.collapsed ? '' : 'rotate-90'}`}
                  />
                  {row.label}
                </button>
              </h2>
            ) : (
              <div role="presentation" className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                {row.games.map((game) => (
                  <div key={game.sgf} role="listitem" className="min-w-0">
                    <GameRecordCard event={event} game={game} translations={translations} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function packRows(
  groups: readonly GameRecordGroup[],
  columnCount: number,
  collapsedGroups: ReadonlySet<string>
): VirtualRow[] {
  const rows: VirtualRow[] = [];

  for (const group of groups) {
    if (group.label) {
      const collapsed = collapsedGroups.has(group.key);

      rows.push({
        type: 'heading',
        key: `heading:${group.key}`,
        groupKey: group.key,
        label: group.label,
        collapsed,
      });

      if (collapsed) {
        continue;
      }
    }

    for (let index = 0; index < group.games.length; index += columnCount) {
      const games = group.games.slice(index, index + columnCount);

      rows.push({
        type: 'games',
        key: `games:${group.key}:${games.map((game) => game.sgf).join('|')}`,
        games,
      });
    }
  }

  return rows;
}
