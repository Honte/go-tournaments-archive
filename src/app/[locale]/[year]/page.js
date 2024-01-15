import { notFound } from 'next/navigation';
import { YearsNavigation } from '@/components/yearsNavigation';
import { getTournaments } from '@/data';
import { League } from '@/components/league';

export default async function Edition({ params: { year, locale }}) {
  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => t.year === Number(year));
  const { id, stages, players, ...details } = tournament;

  return (
    <>
      <YearsNavigation locale={locale} years={tournaments.map((t) => t.id)} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Informacje</h2>
          <dl className="grid grid-cols-2">
            {Object.entries(details).map(([label, response]) => (
              <>
                <dt className="font-bold after:content-[':']">{label}</dt>
                <dd>{response}</dd>
              </>
            ))}
          </dl>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Medaliści</h2>
          <ol className="list-decimal pl-5">
            {Object.values(players).slice(0, 3).map((winner) => <li key={winner.id} className="my-1">{winner.name}</li>)}
          </ol>
        </div>
      </div>

      {tournament.stages.map((stage) => {
        switch (stage.type) {
          case 'league':
            return <League stage={stage} locale={locale} players={tournament.players}/>
          default:
            return (
              <div className="my-4">
                <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Stage {stage.type}</h2>
              </div>
            )
        }
      })}
    </>
  )
}
