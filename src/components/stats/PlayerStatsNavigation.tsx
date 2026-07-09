import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { playerUrl } from '@/libs/urls';
import { PillLink } from '@/components/ui/PillLink';

type PlayerStatsNavigationProps = {
  event: EventContext;
  slug: string;
  locale: Locale;
  category?: string;
  categories: string[];
  translations: Translations;
};

export function PlayerStatsNavigation({
  event,
  slug,
  locale,
  category,
  categories,
  translations,
}: PlayerStatsNavigationProps) {
  const t = getTranslator(translations);
  const links =
    categories.length === 1
      ? [
          {
            key: categories[0],
            label: t(`categories.short.${categories[0]}`),
            href: playerUrl(event, locale, slug),
            active: true,
          },
        ]
      : [
          {
            key: 'all',
            label: t('categories.all'),
            href: playerUrl(event, locale, slug),
            active: !category,
          },
          ...categories.map((targetCategory) => ({
            key: targetCategory,
            label: t(`categories.short.${targetCategory}`),
            href: playerUrl(event, locale, slug, targetCategory),
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
