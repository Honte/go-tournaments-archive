import Link from 'next/link';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { allCountryStatsUrl } from '@/libs/urls';

type AllCountriesStatsLinkProps = {
  event: EventContext;
  translations: Translations;
};

export function AllCountriesStatsLink({ event, translations }: AllCountriesStatsLinkProps) {
  const t = getTranslator(translations);

  return (
    <p className="text-center my-2">
      <Link
        href={allCountryStatsUrl(event.prefix, translations.locale)}
        className="underline underline-offset-2 text-event-primary cursor-pointer hover:text-event-hover"
        prefetch={false}
      >
        {t('stats.goToAllCountriesStats')}
      </Link>
    </p>
  );
}
