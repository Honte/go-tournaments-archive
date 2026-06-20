import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { loadEvent } from '@/events';
import { BaseLayout } from '@/components/pages/BaseLayout';
import { getEventLayoutMetadata } from '@/components/pages/EventLayout';

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{ eventId: string }>;
}>;

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const event = await loadEvent((await params).eventId);

  return getEventLayoutMetadata({ event, locale: event.locales[0] });
}

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const event = await loadEvent((await params).eventId);

  return <BaseLayout locale={event.locales[0]}>{children}</BaseLayout>;
}
