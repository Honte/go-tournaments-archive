import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { CategoryPage, getCategoryPageMetadata, getCategoryPageOptions } from '@/components/pages/CategoryPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
    category: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale, category } = await params;
  const event = await loadDefaultEvent();

  return <CategoryPage event={event} locale={locale} category={category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const event = await loadDefaultEvent();

  return getCategoryPageMetadata({ event, locale, category });
}

export async function generateStaticParams() {
  return getCategoryPageOptions(await loadDefaultEvent());
}
