'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type LocaleNavigationProps = {
  locales: string[];
  locale: string;
};

export function LocaleNavigation({ locale, locales }: LocaleNavigationProps) {
  const pathname = usePathname();
  const regex = new RegExp(`^/${locale}`);

  if (locales.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-3 text-sm text-event-light ml-auto">
      {locales.map((nextLocale) => (
        <Link
          key={nextLocale}
          className={nextLocale === locale ? 'font-bold' : 'underline'}
          href={pathname.replace(regex, `/${nextLocale}`)}
          prefetch={false}
          aria-current={nextLocale === locale ? 'true' : undefined}
        >
          {nextLocale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
