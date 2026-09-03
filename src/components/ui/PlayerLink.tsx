import { clsx } from 'clsx';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { playerUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

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
      className={clsx('underline underline-offset-2 hover:text-archive-link-hover', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
