import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type H1Props = PropsWithChildren<{
  className?: string;
}>;

export function H1({ children, className }: H1Props) {
  return <h1 className={clsx('text-2xl font-bold pb-1 my-3 border-b-event-dark border-b-2', className)}>{children}</h1>;
}
