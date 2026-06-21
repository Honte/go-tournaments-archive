import type { Metadata } from 'next';
import { loadEventFromPrefix } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { AllPlayersPage, getAllPlayersPageMetadata, getAllPlayersPageOptions } from '@/components/pages/AllPlayersPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return <AllPlayersPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getAllPlayersPageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return loadAllOptions(getAllPlayersPageOptions);
}
