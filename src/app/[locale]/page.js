import { Fragment } from 'react';
import Link from 'next/link';
import { getStats, getTournaments } from '@/data';

export default async function Home({ params: { locale }}) {
  const tournaments = getTournaments().toSorted((a, b) => b.id - a.id);
  const stats = getStats();

  console.log(stats);

  return (
    <>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">Medaliści Mistrzostw Polski</h1>
      <div className="grid grid-cols-pgc my-3 gap-1 items-center">
        <strong>Edycja</strong>
        <strong>Zwycięzca</strong>
        <strong>2 miejsce</strong>
        <strong>3 miejsce</strong>
        {tournaments.map(({year, top, players}) => (
          <Fragment key={year}>
            <Link href={`/${locale}/${year}`}
                  className="sm:text-xl font-bold text-pgc-primary underline hover:text-pgc-hover">{year}</Link>
            {top.map((winner, index) => <div
              key={index}>{winner.split(',').map((id) => `${players[id].name} (${players[id].rank})`).join(', ')}</div>)}
          </Fragment>
        ))}
      </div>

      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">Champions</h1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {stats.winners.filter((p) => p.medals[0] > 0).map((p) => <li key={p.name}>{p.name} - {p.medals[0]}</li>)}
        </ol>
      </div>

      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">Attendants</h1>
      <div className="items-center">
        <ol className="list-decimal mx-8">
          {stats.attendants.slice(0, 10).map((p) => <li key={p.name}>{p.name} - {p.attended.length}</li>)}
        </ol>
      </div>
    </>
  )
}
