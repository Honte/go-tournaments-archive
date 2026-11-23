import type { Metadata } from 'next';
import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { LocaleRedirect } from '@/components/LocaleRedirect';
import { getEventRedirectMetadata } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function RootPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = await loadEventFromPrefix(eventId);

  return <LocaleRedirect event={event} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getEventRedirectMetadata(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
