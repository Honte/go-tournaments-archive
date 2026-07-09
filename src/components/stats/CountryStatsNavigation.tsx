import { clsx } from 'clsx';
import Link from 'next/link';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { countryUrl } from '@/libs/urls';

type CountryStatsNavigationProps = {
  event: EventContext;
  code: string;
  locale: Locale;
  category?: string;
  categories: string[];
  translations: Translations;
};

export function CountryStatsNavigation({
  event,
  code,
  locale,
  category,
  categories,
  translations,
}: CountryStatsNavigationProps) {
  const t = getTranslator(translations);
  const links = [
    {
      key: 'all',
      label: t('categories.all'),
      href: countryUrl(event, locale, code),
      active: !category,
    },
    ...categories.map((targetCategory) => ({
      key: targetCategory,
      label: t(`categories.short.${targetCategory}`),
      href: countryUrl(event, locale, code, targetCategory),
      active: category === targetCategory,
    })),
  ];

  return (
    <nav aria-label={t('navigation.categories')} className="flex flex-wrap gap-2 mx-auto">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          prefetch={false}
          aria-current={link.active ? 'page' : undefined}
          className={clsx(
            'inline-flex rounded-sm px-2 py-0.5 font-bold',
            link.active ? 'bg-event-primary text-white' : 'bg-gray-300 text-event-dark hover:bg-gray-400'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
