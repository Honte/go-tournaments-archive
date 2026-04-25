'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@/i18n/consts';

export type LocaleNavigationProps = {
  locale: string;
};

export function LocaleNavigation({ locale }: LocaleNavigationProps) {
  const pathname = usePathname();
  const regex = new RegExp(`^/${locale}`);

  return (
    <div className="flex gap-3 text-sm text-event-light ml-auto">
      {SUPPORTED_LOCALES.map((nextLocale) => (
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
