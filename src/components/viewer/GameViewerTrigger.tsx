'use client';

import { clsx } from 'clsx';
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
      className={clsx(
        'inline-block cursor-pointer',
        'border-archive-border-strong border rounded',
        'hover:scale-[1.05] transition-transform duration-200',
        'overflow-hidden',
        'bg-archive-page',
        'focus:border-archive-accent focus:scale-[1.05]',
        'active:border-archive-accent-hover',
        'p-0 outline-none',
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
