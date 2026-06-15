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
  const tournaments = (await getTournaments(event)).toSorted((a, b) => b.id - a.id);
  const attendants = await getTopAttendants(event, 10);
  const medalists = await getPlayerMedalists(event);
  const countryMedals = await getCountryMedals(event);
  const totalStats = await getTotalStats(event);

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
