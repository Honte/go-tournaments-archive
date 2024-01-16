import { notFound } from 'next/navigation';
import { YearsNavigation } from '@/components/yearsNavigation';
import { getTournaments } from '@/data';
import { League } from '@/components/league';
import { TournamentDetails } from '@/components/tournamentDetails';

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
        <TournamentDetails tournament={tournament} locale={locale}/>

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
