import { clsx } from 'clsx';
import Link from 'next/link';
import type { ComponentProps, PropsWithChildren } from 'react';

type PlayerLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    playerId: string;
    locale: string;
    hasStats?: boolean;
  }>;

export function PlayerLink({ playerId, hasStats = true, locale, children, className, ...props }: PlayerLinkProps) {
  if (!hasStats) {
    return <span className={className}>{children}</span>;
  }

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
