import { notFound } from 'next/navigation';
import { YearsNavigation } from '@/components/yearsNavigation';
import { getTournaments } from '@/data';
import { League } from '@/components/league';
import { TournamentDetails } from '@/components/tournamentDetails';
import { Awarded } from '@/components/awarded';
import { StageFinal } from '@/components/stageFinal';

export default async function Edition({ params: { year, locale }}) {
  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => t.year === Number(year));
  const { games, players } = tournament;

  return (
    <>
      <YearsNavigation locale={locale} years={tournaments.map((t) => t.id)} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-4">
        <TournamentDetails tournament={tournament} locale={locale}/>
        <Awarded tournament={tournament} locale={locale}/>
      </div>

      {tournament.stages.map((stage) => {
        switch (stage.type) {
          case 'league':
            return <League stage={stage} locale={locale} games={games} players={players}/>
          case 'final':
            return <StageFinal stage={stage} locale={locale} games={games} players={players}/>
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
