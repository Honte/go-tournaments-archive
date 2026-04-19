import EVENT_CONFIG from '@event/config';
import { getCategoryStats } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type Locale, SUPPORTED_LOCALES } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { CategoryMedalTable } from '@/components/category/CategoryMedalTable';
import { CategoryResultsTable } from '@/components/category/CategoryResultsTable';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type PageProps = {
  params: Promise<{
    locale: Locale;
    category: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return {
    title: `${t('site.categoryStatsTitle', name)} - ${t('site.name')}`,
    description: t('site.categoryStatsDescription', name),
  };
}

export default async function CategoryStats({ params }: PageProps) {
  if (!EVENT_CONFIG.categories?.length) {
    return notFound();
  }

  const { locale, category } = await params;

  const translations = await loadTranslations(locale);
  const stats = await getCategoryStats(category);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return (
    <Content>
      <Title>{name}</Title>
      <div className="flex max-sm:flex-col-reverse gap-4">
        <CategoryResultsTable category={category} stats={stats} translations={translations} />
        <CategoryMedalTable category={category} translations={translations} stats={stats} />
      </div>
    </Content>
  );
}

export async function generateStaticParams() {
  if (!EVENT_CONFIG.categories?.length) {
    return [
      {
        category: 'none',
        locale: 'en',
      },
    ];
  }

  const pages = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const category of EVENT_CONFIG.categories) {
      pages.push({ locale, category });
    }
  }

  return pages;
}
