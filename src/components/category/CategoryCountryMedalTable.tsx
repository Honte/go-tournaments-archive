import type { CategoryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getCategoryCountryMedalists } from '@/libs/category';
import { MedalTable } from '@/components/MedalTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H1 } from '@/components/ui/H1';

type CategoryCountryMedalTableProps = {
  event: EventContext;
  stats: CategoryStats;
  translations: Translations;
};

export function CategoryCountryMedalTable({ event, stats, translations }: CategoryCountryMedalTableProps) {
  const medalists = getCategoryCountryMedalists(stats);
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.countries')}</H1>
      <MedalTable
        translations={translations}
        results={medalists}
        toKey={(item) => item.country}
        toName={(item) => <CountryLink event={event} translations={translations} code={item.country} full={true} />}
      />
    </div>
  );
}
