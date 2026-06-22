import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { loadConfiguredEvents, loadEventFromPrefix } from '@/events';
import { BaseLayout } from '@/components/pages/BaseLayout';
import { EventLayout, getEventLayoutMetadata } from '@/components/pages/EventLayout';
import { loadConfiguration } from '@/configuration';

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
}>;

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return (
    <BaseLayout locale={locale}>
      <EventLayout event={event} locale={locale}>
        {children}
      </EventLayout>
    </BaseLayout>
  );
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getEventLayoutMetadata({ event, locale });
}

export async function generateStaticParams() {
  const configuration = await loadConfiguration();
  const allEvents = await loadConfiguredEvents(configuration);
  const results = [];

  for (const event of allEvents) {
    for (const locale of event.locales) {
      results.push({ eventId: event.id, locale });
    }
  }

  return results;
}
