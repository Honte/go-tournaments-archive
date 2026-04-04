import Link from 'next/link';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

type FullStatsLinkProps = {
  translations: Translations;
};

export function FullStatsLink({ translations }: FullStatsLinkProps) {
  const t = getTranslator(translations);

  return (
    <p className="text-center my-2">
      <Link
        href={`${translations.locale}/stats`}
        className="underline underline-offset-2 text-pgc-primary cursor-pointer hover:text-pgc-hover"
      >
        {t('stats.full')}
      </Link>
    </p>
  );
}
