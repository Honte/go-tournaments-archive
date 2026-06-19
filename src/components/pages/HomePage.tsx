import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getEventSummary, getTournaments, getTranslations } from '@/data/serverApi';
import { Attendants } from '@/components/Attendants';
import { CountryMedalists } from '@/components/CountryMedalists';
import { Hero } from '@/components/Hero';
import { Medalists } from '@/components/Medalists';
import { TotalStats } from '@/components/TotalStats';
import { Winners } from '@/components/Winners';

export type HomePageProps = {
  event: EventContext;
  locale: Locale;
};

export async function HomePage({ event, locale }: HomePageProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const tournaments = (await getTournaments(event)).toSorted((a, b) => b.id - a.id);
  const summary = await getEventSummary(event);

  const { totalStats, medalists, attendants, countryMedals } = summary;

  return (
    <>
      <Hero event={event} translations={translations} />
      <div className="xl:grid xl:grid-cols-4 xl:gap-4">
        <div className="xl:col-span-3 xl:row-span-5">
          <Winners event={event} translations={translations} tournaments={tournaments} />
        </div>
        {event.showCountry && <CountryMedalists event={event} countries={countryMedals} translations={translations} />}
        <Medalists event={event} translations={translations} players={medalists} />
        <Attendants event={event} translations={translations} players={attendants} />
        <TotalStats translations={translations} stats={totalStats} />
      </div>
    </>
  );
}
