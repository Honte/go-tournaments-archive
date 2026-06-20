import type { Metadata } from 'next';
import { loadEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { CategoryPage, getCategoryPageMetadata, getCategoryPageOptions } from '@/components/pages/CategoryPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    locale: Locale;
    category: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale, category } = await params;
  const event = await loadEvent(eventId);

  return <CategoryPage event={event} locale={locale} category={category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, locale, category } = await params;
  const event = await loadEvent(eventId);

  return getCategoryPageMetadata({ event, locale, category });
}

export async function generateStaticParams() {
  return loadAllOptions(getCategoryPageOptions);
}
