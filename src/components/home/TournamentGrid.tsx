'use client';

import { useId, useState, type ReactNode } from 'react';
import { LuArrowRight, LuChevronDown } from 'react-icons/lu';
import { Button } from '@/components/ui/Button';

type TournamentGridProps = {
  announcements: ReactNode[];
  items: ReactNode[];
  lessLabel: string;
  moreLabel: string;
  statsHref: string;
  statsLabel: string;
  previewCount?: number;
};

export function TournamentGrid({
  announcements,
  items,
  lessLabel,
  moreLabel,
  statsHref,
  statsLabel,
  previewCount,
}: TournamentGridProps) {
  const [expanded, setExpanded] = useState(false);
  const gridId = useId();
  const expandable = previewCount !== undefined && items.length > previewCount;
  const visibleItems = expandable && !expanded ? items.slice(0, previewCount) : items;
  const showMoreCard = expandable && !expanded;
  const cardButtonClass =
    'justify-center text-center text-sm md:h-full md:w-full md:rounded-none md:bg-archive-surface md:text-base md:font-semibold md:hover:bg-archive-surface-hover-accent md:focus-visible:-outline-offset-2';

  return (
    <div className="flex flex-col gap-10">
      {announcements.length > 0 && <div className="space-y-5">{announcements}</div>}
      <div>
        <div id={gridId} className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems}
          {showMoreCard && (
            <div className="flex flex-col items-center gap-3 md:grid md:h-full md:grid-rows-[2fr_1fr] md:gap-0 md:self-stretch md:overflow-hidden md:rounded-xl md:border md:border-archive-border md:bg-archive-surface md:shadow-sm">
              <Button
                type="button"
                aria-expanded={false}
                aria-controls={gridId}
                className={`${cardButtonClass} md:p-6`}
                icon={<LuChevronDown className="size-4" />}
                onClick={() => setExpanded(true)}
              >
                {moreLabel}
              </Button>
              <Button
                href={statsHref}
                className={`${cardButtonClass} md:border-t md:border-archive-border md:p-3`}
                icon={<LuArrowRight className="size-4" />}
              >
                {statsLabel}
              </Button>
            </div>
          )}
        </div>
        {!showMoreCard && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {expandable && expanded && (
              <Button
                type="button"
                aria-expanded={true}
                aria-controls={gridId}
                className="text-sm"
                icon={<LuChevronDown className="size-4 rotate-180" />}
                onClick={() => setExpanded(false)}
              >
                {lessLabel}
              </Button>
            )}
            <Button href={statsHref} className="text-sm" icon={<LuArrowRight className="size-4" />}>
              {statsLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
