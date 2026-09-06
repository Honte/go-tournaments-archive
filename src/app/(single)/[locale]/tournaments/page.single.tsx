import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import {
  TournamentsPage,
  getTournamentsPageMetadata,
  getTournamentsPageOptions,
} from '@/components/pages/TournamentsPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return <TournamentsPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return getTournamentsPageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getTournamentsPageOptions(await loadSingleEvent());
}
