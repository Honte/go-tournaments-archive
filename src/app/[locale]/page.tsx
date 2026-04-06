import EVENT_CONFIG from '@event/config';
import { getCountryMedals, getPlayerMedalists, getTopAttendants, getTotalStats, getTournaments } from '@/data';
import { Activity } from 'react';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { Attendants } from '@/components/Attendants';
import { Banner } from '@/components/Banner';
import { CountryMedalists } from '@/components/CountryMedalists';
import { Medalists } from '@/components/Medalists';
import { TotalStats } from '@/components/TotalStats';
import { Winners } from '@/components/Winners';

const SHOW_BANNER = false;

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const translations = await loadTranslations(locale);
  const tournaments = (await getTournaments()).toSorted((a, b) => b.id - a.id);
  const attendants = await getTopAttendants(10);
  const medalists = await getPlayerMedalists();
  const countryMedals = await getCountryMedals();
  const totalStats = await getTotalStats();

  const t = getTranslator(translations);

  return (
    <div className="xl:grid xl:grid-cols-4 xl:gap-4">
      <div className="xl:col-span-3 xl:row-span-5">
        <Activity mode={SHOW_BANNER ? 'visible' : 'hidden'}>
          <Banner
            href={t('currentEdition.website')}
            tooltip={t('currentEdition.tooltip')}
            title={t('currentEdition.title')}
            subtitle={t('currentEdition.subtitle')}
          />
        </Activity>
        <Winners translations={translations} tournaments={tournaments} />
      </div>
      {EVENT_CONFIG.showCountry && <CountryMedalists countries={countryMedals} translations={translations} />}
      <Medalists translations={translations} players={medalists} />
      <Attendants translations={translations} players={attendants} />
      <TotalStats translations={translations} stats={totalStats} />
    </div>
  );
}
