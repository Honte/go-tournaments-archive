'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { Button } from '@/components/ui/Button';
import { type GameViewerPayload } from '@/components/viewer/schema';
import { dispatchGameEvent } from '@/components/viewer/utils';

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
      onClick={() => dispatchGameEvent(payload)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GameViewButton({ payload, children, ...props }: GameLinkProps) {
  return (
    <Button {...props} onClick={() => dispatchGameEvent(payload)}>
      {children}
    </Button>
  );
}
