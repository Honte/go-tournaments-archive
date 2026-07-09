import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { getPlayerCategoryPageOptions, getPlayerPageMetadata, PlayerPage } from '@/components/pages/PlayerPage';

type PageProps = {
  params: Promise<{
    slug: string;
    locale: Locale;
    category: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale, slug, category } = await params;
  const event = await loadSingleEvent();

  return <PlayerPage event={event} locale={locale} slug={slug} category={category} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale, category } = await params;
  const event = await loadSingleEvent();

  return getPlayerPageMetadata({ event, locale, slug, category });
}

export async function generateStaticParams() {
  return getPlayerCategoryPageOptions(await loadSingleEvent());
}
