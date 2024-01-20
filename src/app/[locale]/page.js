import { getStats, getTournaments } from '@/data';
import { Winners } from '@/components/winners';
import { Medalists } from '@/components/medalists';
import { Attendants } from '@/components/attendants';
import { TotalStats } from '@/components/totalStats';
import { loadTranslations } from '@/i18n/server';

export default async function Home({ params: { locale }}) {
  const translations = await loadTranslations(locale);
  const tournaments = (await getTournaments()).toSorted((a, b) => b.id - a.id);
  const stats = await getStats();

  return (
    <div className="xl:grid xl:grid-cols-4 xl:gap-4">
      <Winners className="xl:col-span-3 xl:row-span-5" translations={translations} tournaments={tournaments}/>
      <Medalists translations={translations} stats={stats}/>
      <Attendants translations={translations} stats={stats}/>
      <TotalStats translations={translations} stats={stats}/>
    </div>
  )
}
