import Link from 'next/link';
import type { PropsWithChildren } from 'react';

type PlayerLinkProps = PropsWithChildren<{
  playerId: string;
  locale: string;
}>;

export function PlayerLink({ playerId, locale, children }: PlayerLinkProps) {
  return (
    <Link
      href={`/${locale}/stats/${playerId}`}
      className="underline underline-offset-2 hover:text-event-hover"
      prefetch={false}
    >
      {children}
    </Link>
  );
}
