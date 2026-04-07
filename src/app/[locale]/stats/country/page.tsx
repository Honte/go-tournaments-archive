import EVENT_CONFIG from '@event/config';
import { getAllCountriesStats } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { AllCountriesStats } from '@/components/AllCountriesStats';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsByCountryTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsByCountryDescription'),
  };
}

export default async function Stats({ params }: PageProps) {
  if (!EVENT_CONFIG.showCountry) {
    return notFound();
  }

  const { locale } = await params;

  const translations = await loadTranslations(locale);
  const countries = await getAllCountriesStats();
  const t = getTranslator(translations);

  return (
    <>
      <h1 className="text-4xl text-center font-bold mb-4">{t('site.allTimeStatsByCountryTitle')}</h1>
      <AllCountriesStats countries={countries} translations={translations} />
    </>
  );
}
