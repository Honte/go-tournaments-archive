import type { Metadata } from 'next';
import { loadEventFromPrefix } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { CountryPage, getCountryPageMetadata, getCountryPageOptions } from '@/components/pages/CountryPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    code: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale, code } = await params;
  const event = await loadEventFromPrefix(eventId);

  return <CountryPage event={event} locale={locale} code={code} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, code, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getCountryPageMetadata({ event, locale, code });
}

export async function generateStaticParams() {
  return loadAllOptions(getCountryPageOptions);
}
