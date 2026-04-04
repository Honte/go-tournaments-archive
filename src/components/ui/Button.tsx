import type { PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren;

export function Button({ children }: ButtonProps) {
  return (
    <button className="bg-gray-300 hover:bg-gray-400 text-event-dark font-bold py-0.5 px-2 rounded inline-flex items-center cursor-pointer">
      {children}
    </button>
  );
}
