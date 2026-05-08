import type { PropsWithChildren } from 'react';

export function Title({ children }: PropsWithChildren) {
  return <h1 className="text-2xl md:text-3xl lg:text-4xl text-center font-bold">{children}</h1>;
}
