import type { PropsWithChildren } from 'react';

export function Title({ children }: PropsWithChildren) {
  return <h1 className="text-4xl text-center font-bold">{children}</h1>;
}
