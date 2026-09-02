'use client';

import { useState, type ReactNode } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { Button } from '@/components/ui/Button';

type WinnersGridProps = {
  announcements: ReactNode[];
  items: ReactNode[];
  lessLabel: string;
  moreLabel: string;
  previewCount?: number;
};

export function WinnersGrid({ announcements, items, lessLabel, moreLabel, previewCount }: WinnersGridProps) {
  const [expanded, setExpanded] = useState(false);
  const expandable = previewCount !== undefined && items.length > previewCount;
  const visibleItems = expandable && !expanded ? items.slice(0, previewCount) : items;
  const showMoreButton = expandable && !expanded && (
    <button
      key="show-more"
      type="button"
      aria-expanded={false}
      className="group flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-2 text-center text-sm font-semibold text-archive-text transition-all hover:text-archive-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-accent md:h-full md:rounded-xl md:border md:border-archive-border md:bg-archive-surface md:p-6 md:text-base md:shadow-sm md:hover:bg-archive-surface-hover md:hover:shadow-md"
      onClick={() => setExpanded(true)}
    >
      {moreLabel}
      <LuChevronDown className="size-4 shrink-0 transition-transform" aria-hidden="true" />
    </button>
  );
  const gridItems = showMoreButton ? [...visibleItems, showMoreButton] : visibleItems;

  return (
    <div className="flex flex-col gap-10">
      {announcements.length > 0 && <div className="space-y-5">{announcements}</div>}
      <div>
        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">{gridItems}</div>
        {expandable && expanded && (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              aria-expanded={true}
              className="text-sm"
              icon={<LuChevronDown className="size-4 rotate-180" />}
              onClick={() => setExpanded(false)}
            >
              {lessLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
