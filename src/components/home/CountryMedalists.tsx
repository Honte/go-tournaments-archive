import type { CountrySummary } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { countryUrl } from '@/libs/urls';
import { MedalTable } from '@/components/MedalTable';

type CountryMedalistsProps = {
  event: EventContext;
  countries: CountrySummary[];
  translations: Translations;
};

export function CountryMedalists({ event, countries, translations }: CountryMedalistsProps) {
  const t = getTranslator(translations);
  const countryName = (code: string) => t(`country.${code.toUpperCase()}`);

  return (
    <MedalTable
      translations={translations}
      results={countries}
      nameHeader={t('table.country')}
      toKey={(item) => item.code}
      toName={(item) => countryName(item.code)}
      toHref={(item) => countryUrl(event, translations.locale, item.code)}
      toLinkLabel={(item) => countryName(item.code)}
    />
  );
}
