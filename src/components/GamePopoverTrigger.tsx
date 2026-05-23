'use client';

import { clsx } from 'clsx';
import { type ElementType, type HTMLAttributes, type JSX, type PropsWithChildren, MouseEvent, useRef } from 'react';
import type { Game, Player } from '@/schema/data';
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
      onClick={(ev: MouseEvent) => {
        document.dispatchEvent(
          new CustomEvent(SHOW_POPOVER_EVENT, {
            detail: {
              game,
              players,
              target: ref.current,
            },
          })
        );
        ev.stopPropagation();
      }}
      ref={ref}
      className={clsx('cursor-pointer', {
        underline: game.props.sgf,
      })}
      {...props}
    >
      {children}
    </Component>
  );
}
