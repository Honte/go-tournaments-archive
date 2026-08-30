import { clsx } from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

type HeaderProps = PropsWithChildren<{
  level: 1 | 2;
  actions?: ReactNode;
  className?: string;
}>;

export function Header({ level, actions, children, className }: HeaderProps) {
  const Component = level === 1 ? 'h1' : 'h2';

  return (
    <Component
      className={clsx(
        'font-bold pb-1 border-b-archive-border-strong border-b-2',
        level === 1 ? 'text-2xl my-3' : 'text-xl my-2',
        actions && 'flex flex-wrap items-center gap-3',
        className
      )}
    >
      {actions ? <span className="flex-1">{children}</span> : children}
      {actions && <span className="ml-auto flex font-normal justify-end">{actions}</span>}
    </Component>
  );
}
