'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import { getOpenViewerSearch } from '@/components/viewer/utils';

export function GameViewerLink({
  sgfPath,
  children,
  className,
  ...props
}: Omit<ComponentProps<'a'>, 'onClick'> & {
  sgfPath: string;
}) {
  const searchParams = useSearchParams();
  const href = getOpenViewerSearch(searchParams, sgfPath);

  return (
    <Link
      className={`block w-fit cursor-pointer border-0 bg-transparent outline-none p-0 ${className ?? ''}`}
      href={href}
      scroll={false}
      onClick={(ev) => {
        ev.stopPropagation();
        ev.preventDefault();

        // next.js router is not able to prevent the scroll fully, so let's use native history API
        window.history.pushState(null, '', href);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
