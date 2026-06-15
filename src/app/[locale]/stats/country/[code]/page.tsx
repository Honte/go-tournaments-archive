import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAllCountriesStats, getCountryStats } from '@/data';
import { CountryPage } from '@/components/pages/CountryPage';

type PageProps = {
  params: Promise<{
    code: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code, locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return {
    title: name ? `${t('site.countryStatsTitle', name)} - ${t('site.name')}` : t('site.name'),
    description: name ? t('site.countryStatsDescription', name) : t('site.description'),
  };
}

export default async function Page({ params }: PageProps) {
  const event = await loadDefaultEvent();

  if (!event.showCountry) {
    return notFound();
  }

  const { locale, code } = await params;
  const translations = await loadTranslations(event, locale);
  const country = await getCountryStats(event, code.toLowerCase());

  if (!country) {
    return notFound();
  }

  return <CountryPage event={event} translations={translations} country={country} />;
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();
  const countries = await getAllCountriesStats(event);
  const codes = Object.keys(countries);

  if (!codes.length) {
    codes.push(event.locales[0]);
  }

  return codes
    .map((code) =>
      event.locales.map((locale) => ({
        locale,
        code: code.toLowerCase(),
      }))
    )
    .flat();
}
