import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllCountriesStats } from '@/components/AllCountriesStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllCountriesPageProps = {
  event: EventContext;
  countries: Record<string, CountryStats>;
  translations: Translations;
};

export function AllCountriesPage({ event, countries, translations }: AllCountriesPageProps) {
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsByCountryTitle')}</Title>
      <AllCountriesStats event={event} countries={countries} locale={translations.locale} />
    </Content>
  );
}
