import { getStats, getTournaments } from '@/data';
import { Winners } from '@/components/winners';
import { Medalists } from '@/components/medalists';
import { Attendants } from '@/components/attendants';
import { TotalStats } from '@/components/totalStats';

export default async function Home({ params: { locale }}) {
  const tournaments = getTournaments().toSorted((a, b) => b.id - a.id);
  const stats = getStats();

  return (
    <div className="xl:grid xl:grid-cols-4 xl:gap-4">
      <Winners className="xl:col-span-3 xl:row-span-5" locale={locale} tournaments={tournaments}/>
      <Medalists locale={locale} stats={stats}/>
      <Attendants locale={locale} stats={stats}/>
      <TotalStats locale={locale} stats={stats}/>
    </div>
  )
}
