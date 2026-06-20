import type { Metadata } from 'next';
import { loadEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { getTournamentPageMetadata, getTournamentPageOptions, TournamentPage } from '@/components/pages/TournamentPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    year: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, year, locale } = await params;
  const event = await loadEvent(eventId);

  return <TournamentPage event={event} locale={locale} year={year} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, year, locale } = await params;
  const event = await loadEvent(eventId);

  return getTournamentPageMetadata({ event, locale, year });
}

export async function generateStaticParams() {
  return loadAllOptions(getTournamentPageOptions);
}
