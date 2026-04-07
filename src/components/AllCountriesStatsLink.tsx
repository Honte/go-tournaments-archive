import Link from 'next/link';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

type AllCountriesStatsLinkProps = {
  translations: Translations;
};

export function AllCountriesStatsLink({ translations }: AllCountriesStatsLinkProps) {
  const t = getTranslator(translations);

  return (
    <p className="text-center my-2">
      <Link
        href={`/${translations.locale}/stats/country`}
        className="underline underline-offset-2 text-event-primary cursor-pointer hover:text-event-hover"
        prefetch={false}
      >
        {t('stats.goToAllCountriesStats')}
      </Link>
    </p>
  );
}
