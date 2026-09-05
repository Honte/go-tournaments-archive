'use client';

import type { SearchOption } from '@/libs/search';

type SearchResultOptionProps = {
  option: SearchOption;
  onNavigate: (href: string) => void;
};

export function SearchResultOption({ option, onNavigate }: SearchResultOptionProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate">{option.primary}</span>
      {option.secondary && (
        <span className="flex min-w-0 items-center justify-between gap-3 text-xs text-archive-text-muted">
          <span className="truncate">{option.secondary}</span>
          {option.gamesHref && option.gamesLabel && (
            <a
              href={option.gamesHref}
              className="shrink-0 underline hover:text-archive-text"
              tabIndex={0}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onNavigate(option.gamesHref!);
              }}
            >
              {option.gamesLabel}
            </a>
          )}
        </span>
      )}
    </div>
  );
}
