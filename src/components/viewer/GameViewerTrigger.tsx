'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { Button } from '@/components/ui/Button';
import { openGameViewer } from '@/components/viewer/utils';

type GameLinkProps = PropsWithChildren<
  Omit<ComponentProps<'button'>, 'type' | 'onClick'> & {
    sgfPath: string;
  }
>;

export function GameViewerTrigger({ sgfPath, children, className, ...props }: GameLinkProps) {
  return (
    <button
      type="button"
      className={`
      block cursor-pointer 
      border-event-dark border-2 rounded-lg 
      hover:scale-[1.05] transition-transform duration-200 
      overflow-hidden
      bg-event-light 
      focus:border-event-primary focus:scale-[1.05]
      active:border-event-hover
      p-0 
      outline-none ${className ?? ''}
      `}
      onClick={() => openGameViewer(sgfPath)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GameViewerButton({ sgfPath, children, ...props }: GameLinkProps) {
  return (
    <Button {...props} onClick={() => openGameViewer(sgfPath)}>
      {children}
    </Button>
  );
}
