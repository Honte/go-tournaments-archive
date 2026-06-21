import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { AllGamesPage, getAllGamesMetadata, getAllGamesPageOptions } from '@/components/pages/AllGamesPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return <AllGamesPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return getAllGamesMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getAllGamesPageOptions(await loadSingleEvent());
}
