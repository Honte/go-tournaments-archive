import { getStats, getTournaments } from '@/data';
import { Activity } from 'react';
import { Attendants } from '@/components/Attendants';
import { Banner } from '@/components/Banner';
import { Medalists } from '@/components/Medalists';
import { TotalStats } from '@/components/TotalStats';
import { Winners } from '@/components/Winners';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';

const SHOW_BANNER = false;

export default async function Home({ params }) {
  const { locale } = await params;
  const translations = await loadTranslations(locale);
  const tournaments = (await getTournaments()).toSorted((a, b) => b.id - a.id);
  const stats = await getStats();

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
      <Medalists translations={translations} stats={stats} />
      <Attendants translations={translations} stats={stats} />
      <TotalStats translations={translations} stats={stats} />
    </div>
  );
}
