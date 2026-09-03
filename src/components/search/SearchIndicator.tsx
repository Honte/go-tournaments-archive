'use client';

import { LuSearch, LuX } from 'react-icons/lu';

type SearchIndicatorProps = {
  hero: boolean;
  expanded: boolean;
  label: string;
  inputId: string;
  onClick: () => void;
};

export function SearchIndicator({ hero, expanded, label, inputId, onClick }: SearchIndicatorProps) {
  return (
    <div className="flex h-full shrink-0 items-center" onTouchEnd={(event) => event.stopPropagation()}>
      <button
        type="button"
        className={`flex h-full shrink-0 cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 ${hero ? 'w-11' : 'w-7.5'} ${expanded ? 'text-archive-text-muted hover:text-archive-text focus-visible:outline-archive-focus-ring' : 'text-xs text-archive-shell-text focus-visible:outline-archive-shell-text'}`}
        aria-label={label}
        aria-expanded={hero ? undefined : expanded}
        aria-controls={inputId}
        title={label}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={onClick}
      >
        {hero || expanded ? <LuX aria-hidden="true" /> : <LuSearch aria-hidden="true" />}
      </button>
    </div>
  );
}
