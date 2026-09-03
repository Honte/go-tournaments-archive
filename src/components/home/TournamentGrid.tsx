'use client';

import { useState, type ReactNode } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { Button } from '@/components/ui/Button';

type TournamentGridProps = {
  announcements: ReactNode[];
  items: ReactNode[];
  lessLabel: string;
  moreLabel: string;
  previewCount?: number;
};

export function TournamentGrid({ announcements, items, lessLabel, moreLabel, previewCount }: TournamentGridProps) {
  const [expanded, setExpanded] = useState(false);
  const expandable = previewCount !== undefined && items.length > previewCount;
  const visibleItems = expandable && !expanded ? items.slice(0, previewCount) : items;
  const showMoreButton = expandable && !expanded && (
    <Button
      key="show-more"
      type="button"
      aria-expanded={false}
      className="justify-center justify-self-center text-center text-sm transition-all md:h-full md:w-full md:rounded-xl md:border md:border-archive-border md:bg-archive-surface md:p-6 md:text-base md:font-semibold md:shadow-sm md:hover:bg-archive-surface-hover-accent md:hover:text-archive-link-hover md:hover:shadow-md md:[&>span]:ml-2"
      icon={<LuChevronDown className="size-4 transition-transform" />}
      onClick={() => setExpanded(true)}
    >
      {moreLabel}
    </Button>
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
