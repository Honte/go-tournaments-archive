import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import {
  AllCountriesPage,
  getAllCountriesPageMetadata,
  getAllCountriesPageOptions,
} from '@/components/pages/AllCountriesPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return <AllCountriesPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return getAllCountriesPageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getAllCountriesPageOptions(await loadSingleEvent());
}
