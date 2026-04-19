import type { StatsCountry } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllCountriesStatsLink } from '@/components/AllCountriesStatsLink';
import { MedalTable } from '@/components/MedalTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H1 } from '@/components/ui/H1';

type CountryMedalistsProps = {
  countries: StatsCountry[];
  translations: Translations;
};

export function CountryMedalists({ countries, translations }: CountryMedalistsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.countries')}</H1>
      <MedalTable
        translations={translations}
        results={countries}
        toKey={(item) => item.country}
        toName={(item) => <CountryLink translations={translations} code={item.country} full={true} />}
      />
      <AllCountriesStatsLink translations={translations} />
    </div>
  );
}
