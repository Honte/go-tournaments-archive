import Link from 'next/link';
import { getTranslator } from '@/i18n/translator';

export function FullStatsLink({ translations }) {
  const t = getTranslator(translations);

  return (
    <p className="text-center my-2">
      <Link href={`${translations.locale}/stats`}
            className="underline underline-offset-2 text-pgc-primary cursor-pointer hover:text-pgc-hover">
        {t('stats.full')}
      </Link>
    </p>
  );
}
