import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type H2Props = PropsWithChildren<{
  className?: string;
}>;

export function H2({ children, className }: H2Props) {
  return <h1 className={clsx('text-xl font-bold pb-1 my-2 border-b-event-dark border-b-2', className)}>{children}</h1>;
}
