'use client';

import { usePathname } from 'next/navigation';
import { HeaderSwitch } from '@/components/ui/HeaderSwitch';
import { useNavigationSearchParams } from '@/hooks/useNavigation';

export type LocaleNavigationProps = {
  strategy: 'query' | 'param';
  locales?: string[];
  locale: string;
  strings: {
    label: string;
  };
};

export function LocaleNavigation({ locale, locales, strategy, strings }: LocaleNavigationProps) {
  const pathname = usePathname();
  const searchParams = useNavigationSearchParams();

  if (!locales || locales.length <= 1 || (strategy === 'param' && !pathname)) {
    return null;
  }

  const regex = new RegExp(`/${locale}(/|$)`);
  const search = searchParams.toString();

  return (
    <HeaderSwitch
      label={strings.label}
      current={locale}
      options={locales.map((nextLocale) => ({
        value: nextLocale,
        label: nextLocale.toUpperCase(),
        content: nextLocale.toUpperCase(),
        href:
          strategy === 'query'
            ? `/?locale=${nextLocale}`
            : `${pathname.replace(regex, `/${nextLocale}$1`)}${search ? `?${search}` : ''}`,
      }))}
    />
  );
}
