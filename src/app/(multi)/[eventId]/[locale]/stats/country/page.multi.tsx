import type { Metadata } from 'next';
import { loadEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import {
  AllCountriesPage,
  getAllCountriesPageMetadata,
  getAllCountriesPageOptions,
} from '@/components/pages/AllCountriesPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale } = await params;
  const event = await loadEvent(eventId);

  return <AllCountriesPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, locale } = await params;
  const event = await loadEvent(eventId);

  return getAllCountriesPageMetadata({ event, locale });
}

export function generateStaticParams() {
  return loadAllOptions(getAllCountriesPageOptions);
}
