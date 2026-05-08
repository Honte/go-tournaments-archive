import type { PropsWithChildren } from 'react';

export function Content({ children }: PropsWithChildren) {
  return <div className="flex flex-col flex-1 gap-2 md:gap-4">{children}</div>;
}
