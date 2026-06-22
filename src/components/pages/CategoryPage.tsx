import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getCategoryStats, getTranslations } from '@/data/serverApi';
import { CategoryCountryMedalTable } from '@/components/category/CategoryCountryMedalTable';
import { CategoryMedalTable } from '@/components/category/CategoryMedalTable';
import { CategoryResultsTable } from '@/components/category/CategoryResultsTable';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type CategoryPageProps = {
  event: EventContext;
  locale: Locale;
  category: string;
};

export async function CategoryPage({ event, locale, category }: CategoryPageProps) {
  if (!event.categories?.length) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const stats = await getCategoryStats(event, category);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return (
    <Content>
      <Title>{name}</Title>
      <div className="xl:grid xl:grid-cols-4 xl:gap-4">
        <CategoryResultsTable
          event={event}
          category={category}
          stats={stats}
          translations={translations}
          className="xl:col-span-3 xl:row-span-2"
        />
        {event.showCountry && <CategoryCountryMedalTable event={event} stats={stats} translations={translations} />}
        <CategoryMedalTable event={event} category={category} translations={translations} stats={stats} />
      </div>
    </Content>
  );
}

export async function getCategoryPageMetadata({ event, locale, category }: CategoryPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return {
    title: `${t('site.categoryStatsTitle', name)} - ${t('site.name')}`,
    description: t('site.categoryStatsDescription', name),
  };
}

export function getCategoryPageOptions(event: EventContext) {
  if (!event.categories?.length) {
    return [
      {
        category: 'none',
        locale: event.locales[0],
      },
    ];
  }

  const pages = [];

  for (const locale of event.locales) {
    for (const category of event.categories) {
      pages.push({ locale, category });
    }
  }

  return pages;
}
