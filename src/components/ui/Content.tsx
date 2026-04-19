import type { PropsWithChildren } from 'react';

export function Content({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
