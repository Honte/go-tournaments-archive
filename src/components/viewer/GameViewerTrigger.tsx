'use client';

import type { ComponentProps, PropsWithChildren } from 'react';
import { Link } from '@/components/navigation/Link';
import { getGameViewerSearch } from '@/components/viewer/utils';
import { useSearchParamHref } from '@/hooks/useSearchParamHref';

type GameLinkProps = PropsWithChildren<
  Omit<ComponentProps<'a'>, 'type' | 'onClick'> & {
    sgfPath: string;
  }
>;

export function GameViewerTrigger({ sgfPath, children, className, ...props }: GameLinkProps) {
  const href = useSearchParamHref(getGameViewerSearch, sgfPath);

  return (
    <Link
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
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
