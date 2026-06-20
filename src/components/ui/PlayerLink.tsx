import { clsx } from 'clsx';
import Link from 'next/link';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { playerUrl } from '@/libs/urls';

type PlayerLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    event: EventContext;
    playerId?: string;
    locale: string;
  }>;

export function PlayerLink({ event, playerId, locale, children, className, ...props }: PlayerLinkProps) {
  if (!playerId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={playerUrl(event, locale, playerId)}
      className={clsx('underline underline-offset-2 hover:text-event-hover', className)}
      prefetch={false}
      {...props}
    >
      {children}
    </Link>
  );
}
