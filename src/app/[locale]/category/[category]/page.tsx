import EVENT_CONFIG from '@event/config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type Locale, SUPPORTED_LOCALES } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
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
  const t = getTranslator(translations);
  const name = t(`categories.full.${category}`);

  return (
    <Content>
      <Title>{name}</Title>
    </Content>
  );
}

export async function generateStaticParams() {
  const pages: { locale: Locale; category: string }[] = [];

  if (!EVENT_CONFIG.categories?.length) {
    return pages;
  }

  for (const locale of SUPPORTED_LOCALES) {
    for (const category of EVENT_CONFIG.categories) {
      pages.push({ locale, category });
    }
  }

  return pages;
}
