import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { countryUrl } from '@/libs/urls';
import { PillLink } from '@/components/ui/PillLink';

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
  const links =
    categories.length === 1
      ? [
          {
            key: categories[0],
            label: t(`categories.short.${categories[0]}`),
            href: countryUrl(event, locale, code),
            active: true,
          },
        ]
      : [
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
        <PillLink key={link.key} label={link.label} href={link.href} active={link.active} />
      ))}
    </nav>
  );
}
