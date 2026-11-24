import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { buildEventHomeMetadata } from '@/libs/metadata';
import { getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
import { ArchiveStats } from '@/components/home/ArchiveStats';
import { Hero } from '@/components/home/Hero';
import { Medalists } from '@/components/home/Medalists';
import { MostFrequentPlayers } from '@/components/home/MostFrequentPlayers';
import { Tournaments } from '@/components/home/Tournaments';

export type HomePageProps = {
  event: EventContext;
  locale: Locale;
};

export async function HomePage({ event, locale }: HomePageProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const tournaments = (await getTournaments(event)).toSorted((a, b) => b.year - a.year || b.id - a.id);
  const summary = await getEventSummary(event);

  const { totalStats, medalists, attendants, countryMedals } = summary;

  return (
    <>
      <Hero event={event} translations={translations} />
      <div className="mt-4 mb-6 flex flex-col gap-10">
        <Tournaments event={event} translations={translations} tournaments={tournaments} />
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          <section className="h-full rounded-xl border border-archive-border bg-archive-surface p-4 shadow-sm sm:p-5">
            <Medalists event={event} translations={translations} players={medalists} countries={countryMedals} />
          </section>
          <section className="h-full rounded-xl border border-archive-border bg-archive-surface p-4 shadow-sm sm:p-5">
            <MostFrequentPlayers event={event} translations={translations} players={attendants} />
          </section>
          <div className="md:col-span-2 xl:col-span-1">
            <ArchiveStats event={event} translations={translations} stats={totalStats} />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getHomePageMetadata({ event, locale }: HomePageProps): Promise<Metadata> {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const [translations, tournaments, summary] = await Promise.all([
    getTranslations(event, locale),
    getTournaments(event),
    getEventSummary(event),
  ]);

  return buildEventHomeMetadata({
    event,
    locale,
    t: getTranslator(translations),
    tournaments,
    totalStats: summary.totalStats,
  });
}

export function getEventRedirectMetadata(event: EventContext): Promise<Metadata> {
  return getHomePageMetadata({ event, locale: event.locales[0] });
}

export async function getHomePageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
