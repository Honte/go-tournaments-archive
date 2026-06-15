import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getCategoryStats } from '@/data';
import { CategoryPage } from '@/components/pages/CategoryPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
    category: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return {
    title: `${t('site.categoryStatsTitle', name)} - ${t('site.name')}`,
    description: t('site.categoryStatsDescription', name),
  };
}

export default async function CategoryStats({ params }: PageProps) {
  const event = await loadDefaultEvent();

  if (!event.categories?.length) {
    return notFound();
  }

  const { locale, category } = await params;

  const translations = await loadTranslations(event, locale);
  const stats = await getCategoryStats(event, category);

  return <CategoryPage event={event} translations={translations} stats={stats} category={category} />;
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

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
