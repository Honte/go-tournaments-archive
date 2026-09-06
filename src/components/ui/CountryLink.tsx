import { clsx } from 'clsx';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { countryUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

export type CountryLinkProps = Omit<ComponentProps<typeof Link>, 'href'> &
  PropsWithChildren<{
    event: EventContext;
    translations: Translations;
    code?: string;
    full?: boolean;
  }>;

export function CountryLink({ event, code, translations, full = false, className, ...props }: CountryLinkProps) {
  if (!code) {
    return null;
  }

  const t = getTranslator(translations);
  const name = t(`country.${code.toUpperCase()}`);

  return (
    <Link
      href={countryUrl(event, translations.locale, code)}
      className={clsx('underline underline-offset-2 hover:text-archive-link-hover', className)}
      title={name}
      {...props}
    >
      {full ? name : code.toUpperCase()}
    </Link>
  );
}
