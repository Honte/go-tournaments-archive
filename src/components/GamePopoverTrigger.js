'use client';

import { useRef } from 'react';
import { SHOW_POPOVER_EVENT } from '@/components/GamePopover';

export function GamePopoverTrigger({ as = 'div', game, players, children, ...props }) {
  const Component = as;
  const ref = useRef(null);

  return (
    <Component
      onClick={() =>
        document.dispatchEvent(
          new CustomEvent(SHOW_POPOVER_EVENT, {
            detail: {
              game,
              players,
              target: ref.current,
            },
          })
        )
      }
      ref={ref}
      className="underline cursor-pointer"
      {...props}
    >
      {children}
    </Component>
  );
}
