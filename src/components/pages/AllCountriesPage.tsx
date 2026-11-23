import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildAllCountriesStatsMetadata } from '@/libs/metadata';
import { getAllCountriesStats, getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
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

export async function getAllCountriesPageMetadata({ event, locale }: AllCountriesPageProps): Promise<Metadata> {
  if (!isEventLocale(event, locale) || !event.showCountry) {
    return notFound();
  }

  const [translations, tournaments, summary, countries] = await Promise.all([
    getTranslations(event, locale),
    getTournaments(event),
    getEventSummary(event),
    getAllCountriesStats(event),
  ]);

  return buildAllCountriesStatsMetadata({
    event,
    locale,
    t: getTranslator(translations),
    tournaments,
    totalStats: summary.totalStats,
    countryCount: Object.keys(countries).length,
  });
}

export async function getAllCountriesPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
