'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameRecordCard } from '@/components/stats/GameRecordCard';

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
  | { type: 'heading'; key: string; label: string }
  | { type: 'games'; key: string; games: ApiGameInfo[] };

const ROW_GAP = 16;

export function VirtualGameRecordGrid({ event, groups, translations }: VirtualGameRecordGridProps) {
  const t = getTranslator(translations);
  const listRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveColumnCount();
  const rows = useMemo(() => packRows(groups, columnCount), [columnCount, groups]);
  const scrollMargin = useScrollMargin(listRef, rows.length);
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => (rows[index]?.type === 'heading' ? 48 : 350),
    gap: ROW_GAP,
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 4,
    scrollMargin,
  });
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
              <h2 className="border-b border-event-dark pb-1 text-lg font-bold">{row.label}</h2>
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

function packRows(groups: readonly GameRecordGroup[], columnCount: number): VirtualRow[] {
  const rows: VirtualRow[] = [];

  for (const group of groups) {
    if (group.label) {
      rows.push({ type: 'heading', key: `heading:${group.key}`, label: group.label });
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

function useResponsiveColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const medium = window.matchMedia('(min-width: 768px)');
    const extraLarge = window.matchMedia('(min-width: 1280px)');
    const update = () => setColumnCount(extraLarge.matches ? 3 : medium.matches ? 2 : 1);

    update();
    medium.addEventListener('change', update);
    extraLarge.addEventListener('change', update);

    return () => {
      medium.removeEventListener('change', update);
      extraLarge.removeEventListener('change', update);
    };
  }, []);

  return columnCount;
}

function useScrollMargin(ref: RefObject<HTMLDivElement | null>, dependency: number) {
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (!ref.current) {
        return;
      }

      const next = ref.current.getBoundingClientRect().top + window.scrollY;
      setScrollMargin((current) => (current === next ? current : next));
    };

    update();
    window.addEventListener('resize', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, [dependency, ref]);

  return scrollMargin;
}
