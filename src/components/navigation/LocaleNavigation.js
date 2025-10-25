'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES } from '@/i18n/consts';

export function LocaleNavigation({ locale }) {
  const pathname = usePathname();
  const regex = new RegExp(`^/${locale}`);

  return (
    <div className="text-pgc-dark container mx-auto max-w-(--breakpoint-2xl) flex justify-end text-sm px-4 py-1 gap-4">
      {SUPPORTED_LOCALES.map((nextLocale) =>
        <Link key={nextLocale}
              className="underline"
              href={pathname.replace(regex, `/${nextLocale}`)}>
          {nextLocale.toUpperCase()}
        </Link>)
      }
    </div>
  );
}
