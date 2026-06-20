import { loadEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllOptions } from '@/libs/next';
import { getHomePageOptions, HomePage } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    eventId: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventId, locale } = await params;
  const event = await loadEvent(eventId);

  return <HomePage event={event} locale={locale} />;
}

export function generateStaticParams() {
  return loadAllOptions(getHomePageOptions);
}
