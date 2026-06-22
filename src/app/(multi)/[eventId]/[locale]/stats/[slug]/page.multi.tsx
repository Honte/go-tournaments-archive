import type { Metadata } from 'next';
import { loadEventFromPrefix } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { getPlayerPageMetadata, getPlayerPageOptions, PlayerPage } from '@/components/pages/PlayerPage';

type PageProps = {
  params: Promise<{
    eventId: string;
    slug: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale, slug } = await params;
  const event = await loadEventFromPrefix(eventId);

  return <PlayerPage event={event} locale={locale} slug={slug} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId, slug, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return getPlayerPageMetadata({ event, locale, slug });
}

export async function generateStaticParams() {
  return loadAllOptions(getPlayerPageOptions);
}
