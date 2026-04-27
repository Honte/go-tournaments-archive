'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { type GameViewerPayload, SHOW_GAME_VIEWER_EVENT } from '@/components/viewer/schema';

type GameLinkProps = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type' | 'onClick'> & {
    payload: GameViewerPayload;
  }
>;

export function GameViewerTrigger({ payload, children, className, ...props }: GameLinkProps) {
  return (
    <button
      type="button"
      className={`block cursor-pointer border-0 bg-transparent outline-none p-0 ${className ?? ''}`}
      onClick={() => {
        document.dispatchEvent(
          new CustomEvent<GameViewerPayload>(SHOW_GAME_VIEWER_EVENT, {
            detail: payload,
          })
        );
      }}
      {...props}
    >
      {children}
    </button>
  );
}
