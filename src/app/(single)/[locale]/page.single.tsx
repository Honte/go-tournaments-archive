import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { getHomePageMetadata, getHomePageOptions, HomePage } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return <HomePage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadSingleEvent();

  return getHomePageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getHomePageOptions(await loadSingleEvent());
}
