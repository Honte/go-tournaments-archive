import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
import { HomePage } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadDefaultEvent();
  const translations = await getTranslations(event, locale);
  const tournaments = (await getTournaments(event)).toSorted((a, b) => b.id - a.id);
  const summary = await getEventSummary(event);

  return <HomePage event={event} translations={translations} tournaments={tournaments} summary={summary} />;
}
