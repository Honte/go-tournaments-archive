'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { Button } from '@/components/ui/Button';
import { dispatchGameEvent } from '@/components/viewer/utils';

type GameLinkProps = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type' | 'onClick'> & {
    sgfPath: string;
  }
>;

export function GameViewerTrigger({ sgfPath, children, className, ...props }: GameLinkProps) {
  return (
    <button
      type="button"
      className={`block cursor-pointer border-0 outline-none p-0 ${className ?? ''}`}
      onClick={() => dispatchGameEvent(sgfPath)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GameViewerButton({ sgfPath, children, ...props }: GameLinkProps) {
  return (
    <Button {...props} onClick={() => dispatchGameEvent(sgfPath)}>
      {children}
    </Button>
  );
}
