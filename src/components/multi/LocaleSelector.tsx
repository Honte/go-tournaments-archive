'use client';

import type { Locale } from '@/i18n/consts';
import { Link } from '@/components/navigation/Link';

export type LocaleSelectorProps = {
  locale: Locale;
  locales?: Locale[];
};

export function LocaleSelector({ locale, locales }: LocaleSelectorProps) {
  if (!locales || locales.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={locale === 'pl' ? 'Wybór języka' : 'Language selection'}
      className="flex gap-3 text-sm text-event-light ml-auto"
    >
      {locales.map((nextLocale) => {
        const isCurrent = nextLocale === locale;

        return (
          <Link
            key={nextLocale}
            className={isCurrent ? 'font-bold' : 'underline'}
            href={`/?locale=${nextLocale}`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {nextLocale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
