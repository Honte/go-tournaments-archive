import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { CountryPage, getCountryPageMetadata, getCountryPageOptions } from '@/components/pages/CountryPage';

type PageProps = {
  params: Promise<{
    code: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale, code } = await params;
  const event = await loadDefaultEvent();

  return <CountryPage event={event} locale={locale} code={code} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code, locale } = await params;
  const event = await loadDefaultEvent();

  return getCountryPageMetadata({ event, locale, code });
}

export async function generateStaticParams() {
  return getCountryPageOptions(await loadDefaultEvent());
}
