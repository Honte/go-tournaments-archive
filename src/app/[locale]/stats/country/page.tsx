import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAllCountriesStats } from '@/data';
import { AllCountriesStats } from '@/components/AllCountriesStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsByCountryTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsByCountryDescription'),
  };
}

export default async function Stats({ params }: PageProps) {
  const event = await loadDefaultEvent();

  if (!event.showCountry) {
    return notFound();
  }

  const { locale } = await params;

  const translations = await loadTranslations(event, locale);
  const countries = await getAllCountriesStats();
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsByCountryTitle')}</Title>
      <AllCountriesStats event={event} countries={countries} locale={locale} />
    </Content>
  );
}
