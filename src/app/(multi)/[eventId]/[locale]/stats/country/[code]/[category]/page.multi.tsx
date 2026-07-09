import type { Metadata } from 'next';
import { loadEventFromPrefix } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { CountryPage, getCountryCategoryPageOptions, getCountryPageMetadata } from '@/components/pages/CountryPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    code: string;
    locale: Locale;
    category: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale, code, category } = await params;
  const event = await loadEventFromPrefix(eventId);

  return <CountryPage event={event} locale={locale} code={code} category={category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, code, locale, category } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getCountryPageMetadata({ event, locale, code, category });
}

export async function generateStaticParams() {
  return loadAllOptions(getCountryCategoryPageOptions);
}
