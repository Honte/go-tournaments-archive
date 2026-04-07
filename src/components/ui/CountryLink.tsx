import { clsx } from 'clsx';
import Link from 'next/link';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

export type CountryLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    code?: string;
    full?: boolean;
    translations: Translations;
  }>;

export function CountryLink({ code, translations, full = false, className, ...props }: CountryLinkProps) {
  if (!code) {
    return null;
  }

  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return (
    <Link
      href={`/${translations.locale}/stats/country/${code.toLowerCase()}`}
      className={clsx('underline underline-offset-2 hover:text-event-hover', className)}
      prefetch={false}
      title={name}
      {...props}
    >
      {full ? name : code.toUpperCase()}
    </Link>
  );
}
