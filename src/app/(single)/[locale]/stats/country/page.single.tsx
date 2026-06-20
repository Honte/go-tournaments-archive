import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
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
  const event = await loadDefaultEvent();

  return <AllCountriesPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadDefaultEvent();

  return getAllCountriesPageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getAllCountriesPageOptions(await loadDefaultEvent());
}
