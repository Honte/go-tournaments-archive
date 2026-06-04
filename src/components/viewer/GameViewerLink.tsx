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
  return (
    <Link
      className={`block w-fit cursor-pointer border-0 bg-transparent outline-none p-0 ${className ?? ''}`}
      href={getOpenViewerSearch(searchParams, sgfPath)}
      scroll={false}
      {...props}
    >
      {children}
    </Link>
  );
}
