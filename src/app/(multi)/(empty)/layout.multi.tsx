import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { BaseLayout } from '@/components/pages/BaseLayout';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Go Tournaments Archive',
    description: 'Archive',
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return <BaseLayout locale="en">{children}</BaseLayout>;
}
