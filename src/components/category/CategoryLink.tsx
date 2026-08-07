import { clsx } from 'clsx';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { categoryUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

export type CategoryLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    event: EventContext;
    category: string;
    locale: string;
  }>;

export function CategoryLink({ event, category, locale, children, className, ...props }: CategoryLinkProps) {
  return (
    <Link
      href={categoryUrl(event, locale, category)}
      className={clsx('underline underline-offset-2 hover:text-event-hover', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
