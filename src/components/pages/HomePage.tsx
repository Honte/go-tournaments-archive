import type { CountryStats, PlayerStats, StatsSummary, Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { Attendants } from '@/components/Attendants';
import { CountryMedalists } from '@/components/CountryMedalists';
import { Hero } from '@/components/Hero';
import { Medalists } from '@/components/Medalists';
import { TotalStats } from '@/components/TotalStats';
import { Winners } from '@/components/Winners';

export type HomePageProps = {
  event: EventContext;
  translations: Translations;
  tournaments: Tournament[];
  totalStats: StatsSummary;
  attendants: PlayerStats[];
  medalists: PlayerStats[];
  countryMedals: CountryStats[];
};

export function HomePage({
  event,
  translations,
  tournaments,
  totalStats,
  attendants,
  medalists,
  countryMedals,
}: HomePageProps) {
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
