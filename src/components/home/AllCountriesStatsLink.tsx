import { LuArrowRight } from 'react-icons/lu';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { allCountryStatsUrl } from '@/libs/urls';
import { Button } from '@/components/ui/Button';

type AllCountriesStatsLinkProps = {
  event: EventContext;
  translations: Translations;
};

export function AllCountriesStatsLink({ event, translations }: AllCountriesStatsLinkProps) {
  const t = getTranslator(translations);

  return (
    <p className="mt-4 flex justify-center">
      <Button
        href={allCountryStatsUrl(event, translations.locale)}
        className="group text-sm"
        icon={<LuArrowRight className="transition-transform group-hover:translate-x-0.5" />}
      >
        {t('stats.goToAllCountriesStats')}
      </Button>
    </p>
  );
}
