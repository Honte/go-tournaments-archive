import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getAllCountriesStats, getTranslations } from '@/data/serverApi';
import { AllCountriesStats } from '@/components/AllCountriesStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllCountriesPageProps = {
  event: EventContext;
  locale: Locale;
};

export async function AllCountriesPage({ event, locale }: AllCountriesPageProps) {
  if (!event.showCountry) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const countries = await getAllCountriesStats(event);
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsByCountryTitle')}</Title>
      <AllCountriesStats event={event} countries={countries} locale={locale} />
    </Content>
  );
}

export async function getAllCountriesPageMetadata({ event, locale }: AllCountriesPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsByCountryTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsByCountryDescription'),
  };
}
