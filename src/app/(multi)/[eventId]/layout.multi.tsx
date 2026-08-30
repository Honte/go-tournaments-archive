import type { PropsWithChildren } from 'react';
import { QueryProvider } from '@/components/QueryProvider';

export default async function Layout({ children }: PropsWithChildren) {
  return <QueryProvider>{children}</QueryProvider>;
}
