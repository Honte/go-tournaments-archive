import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { CountryPage, getCountryCategoryPageOptions, getCountryPageMetadata } from '@/components/pages/CountryPage';

type PageProps = {
  params: Promise<{
    code: string;
    locale: Locale;
    category: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale, code, category } = await params;
  const event = await loadSingleEvent();

  return <CountryPage event={event} locale={locale} code={code} category={category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code, locale, category } = await params;
  const event = await loadSingleEvent();

  return getCountryPageMetadata({ event, locale, code, category });
}

export async function generateStaticParams() {
  return getCountryCategoryPageOptions(await loadSingleEvent());
}
