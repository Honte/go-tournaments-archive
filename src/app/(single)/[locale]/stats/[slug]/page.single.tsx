import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { getPlayerPageMetadata, getPlayerPageOptions, PlayerPage } from '@/components/pages/PlayerPage';

type PageProps = {
  params: Promise<{
    slug: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  const event = await loadSingleEvent();

  return <PlayerPage event={event} locale={locale} slug={slug} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const event = await loadSingleEvent();

  return getPlayerPageMetadata({ event, locale, slug });
}

export async function generateStaticParams() {
  return getPlayerPageOptions(await loadSingleEvent());
}
