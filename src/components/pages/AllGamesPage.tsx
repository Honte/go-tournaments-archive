import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildGamesMetadata } from '@/libs/metadata';
import { getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
import { AllGames } from '@/components/gameRecords/AllGames';
import { Content } from '@/components/ui/Content';
import { Loader } from '@/components/ui/Loader';

type AllGamesPageProps = {
  event: EventContext;
  locale: Locale;
};

export async function AllGamesPage({ event, locale }: AllGamesPageProps) {
  return (
    <Content>
      <Suspense fallback={<Loader />}>
        <AllGames event={event} locale={locale} />
      </Suspense>
    </Content>
  );
}

export async function getAllGamesMetadata({ event, locale }: AllGamesPageProps): Promise<Metadata> {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const [translations, tournaments, summary] = await Promise.all([
    getTranslations(event, locale),
    getTournaments(event),
    getEventSummary(event),
  ]);

  return buildGamesMetadata({
    event,
    locale,
    t: getTranslator(translations),
    tournaments,
    totalStats: summary.totalStats,
  });
}

export async function getAllGamesPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
