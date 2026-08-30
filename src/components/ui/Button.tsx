import type { ComponentProps } from 'react';

export function Button({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={`bg-archive-control hover:bg-archive-control-hover text-archive-text aria-expanded:bg-archive-control-selected aria-expanded:text-archive-control-selected-text aria-expanded:hover:bg-archive-control-selected aria-pressed:bg-archive-control-selected aria-pressed:text-archive-control-selected-text aria-pressed:hover:bg-archive-control-selected font-bold py-0.5 px-2 rounded inline-flex items-center cursor-pointer ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
