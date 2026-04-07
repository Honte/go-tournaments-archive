import { clsx } from 'clsx';
import Link from 'next/link';
import type { ComponentProps, PropsWithChildren } from 'react';

type PlayerLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    playerId: string;
    locale: string;
  }>;

export function PlayerLink({ playerId, locale, children, className, ...props }: PlayerLinkProps) {
  return (
    <Link
      href={`/${locale}/stats/${playerId}`}
      className={clsx('underline underline-offset-2 hover:text-event-hover', className)}
      prefetch={false}
      {...props}
    >
      {children}
    </Link>
  );
}
