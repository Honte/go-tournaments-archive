'use client';

import type { Game, Player } from '@/schema/data';
import { type ElementType, type HTMLAttributes, type JSX, type PropsWithChildren, useRef } from 'react';
import { SHOW_POPOVER_EVENT } from '@/components/GamePopover';

type GamePopoverTriggerProps = PropsWithChildren<
  {
    as?: keyof JSX.IntrinsicElements;
    game: Game;
    players: Record<string, Player>;
  } & HTMLAttributes<HTMLElement>
>;

export function GamePopoverTrigger({ as = 'div', game, players, children, ...props }: GamePopoverTriggerProps) {
  const Component = as as ElementType;
  const ref = useRef<HTMLElement>(null);

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
