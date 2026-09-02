'use client';

import { useState, type ReactNode } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { Button } from '@/components/ui/Button';

type ExpandableContentProps = {
  actions?: ReactNode;
  collapsed: ReactNode;
  expanded: ReactNode;
  lessLabel: string;
  moreLabel: string;
};

export function ExpandableContent({ actions, collapsed, expanded, lessLabel, moreLabel }: ExpandableContentProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">{open ? expanded : collapsed}</div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 [&>p]:mt-0">
        <Button
          type="button"
          aria-expanded={open}
          className="text-sm"
          icon={<LuChevronDown className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? lessLabel : moreLabel}
        </Button>
        {actions}
      </div>
    </div>
  );
}
