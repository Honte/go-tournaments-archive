import { clsx } from 'clsx';
import Link from 'next/link';
import type { ComponentProps, PropsWithChildren } from 'react';

export type CategoryLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    category: string;
    locale: string;
  }>;

export function CategoryLink({ category, locale, children, className, ...props }: CategoryLinkProps) {
  return (
    <Link
      href={`/${locale}/category/${category}`}
      className={clsx('underline underline-offset-2 hover:text-event-hover', className)}
      prefetch={false}
      {...props}
    >
      {children}
    </Link>
  );
}
