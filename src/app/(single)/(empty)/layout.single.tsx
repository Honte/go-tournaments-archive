import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadSingleEvent } from '@/events';
import { BaseLayout } from '@/components/pages/BaseLayout';
import '@/globals.css';
import { getEventLayoutMetadata } from '@/components/pages/EventLayout';

export async function generateMetadata(): Promise<Metadata> {
  const event = await loadSingleEvent();

  return getEventLayoutMetadata({ event, locale: event.locales[0] });
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const event = await loadSingleEvent();

  return <BaseLayout locale={event.locales[0]}>{children}</BaseLayout>;
}
