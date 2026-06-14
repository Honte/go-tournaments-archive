import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getCountryMedals, getPlayerMedalists, getTopAttendants, getTotalStats, getTournaments } from '@/data';
import { HomePage } from '@/components/pages/HomePage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const tournaments = (await getTournaments()).toSorted((a, b) => b.id - a.id);
  const attendants = await getTopAttendants(10);
  const medalists = await getPlayerMedalists();
  const countryMedals = await getCountryMedals();
  const totalStats = await getTotalStats();

  return (
    <HomePage
      event={event}
      translations={translations}
      tournaments={tournaments}
      totalStats={totalStats}
      attendants={attendants}
      medalists={medalists}
      countryMedals={countryMedals}
    />
  );
}
