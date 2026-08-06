'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/components/navigation/Link';
import { useNavigationSearchParams } from '@/hooks/useNavigation';

export type LocaleNavigationProps = {
  locales: string[];
  locale: string;
};

export function LocaleNavigation({ locale, locales }: LocaleNavigationProps) {
  const pathname = usePathname();
  const searchParams = useNavigationSearchParams();

  if (locales.length <= 1 || !pathname) {
    return null;
  }

  const regex = new RegExp(`/${locale}(/|$)`);
  const search = searchParams.toString();

  return (
    <div className="flex gap-3 text-sm text-event-light ml-auto">
      {locales.map((nextLocale) => (
        <Link
          key={nextLocale}
          className={nextLocale === locale ? 'font-bold' : 'underline'}
          href={`${pathname.replace(regex, `/${nextLocale}$1`)}${search ? `?${search}` : ''}`}
          aria-current={nextLocale === locale ? 'true' : undefined}
        >
          {nextLocale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
