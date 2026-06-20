import { loadEvent } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { LocaleRedirect } from '@/components/LocaleRedirect';

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function RootPage({ params }: PageProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);

  return <LocaleRedirect event={event} />;
}

export async function generateStaticParams() {
  return loadEventOptions();
}
