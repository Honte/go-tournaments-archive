'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type LocaleNavigationProps = {
  locales: string[];
  locale: string;
};

export function LocaleNavigation({ locale, locales }: LocaleNavigationProps) {
  const pathname = usePathname();

  if (locales.length <= 1 || !pathname) {
    return null;
  }

  const regex = new RegExp(`/${locale}(/|$)`);

  return (
    <div className="flex gap-3 text-sm text-event-light ml-auto">
      {locales.map((nextLocale) => (
        <Link
          key={nextLocale}
          className={nextLocale === locale ? 'font-bold' : 'underline'}
          href={pathname.replace(regex, `/${nextLocale}$1`)}
          prefetch={false}
          aria-current={nextLocale === locale ? 'true' : undefined}
        >
          {nextLocale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
