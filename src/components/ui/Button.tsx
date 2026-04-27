import type { ComponentProps } from 'react';

export function Button({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={`bg-gray-300 hover:bg-gray-400 text-event-dark font-bold py-0.5 px-2 rounded inline-flex items-center cursor-pointer ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
