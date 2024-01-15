import { Fragment } from 'react';
import Link from 'next/link';
import { getTournaments } from '@/data';

export default async function Home({ params: { locale }}) {
  const tournaments = getTournaments().toSorted((a, b) => b.id - a.id);

  return (
    <>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">Medaliści Mistrzostw Polski</h1>
      <div className="grid grid-cols-pgc my-3 gap-1 items-center">
        {tournaments.map(({ year, players }) => (
          <Fragment key={year}>
            <Link href={`/${locale}/${year}`} className="text-xl font-bold text-pgc-primary underline hover:text-pgc-hover">{year}</Link>
            {Object.values(players).slice(0, 3).map((winner) => <div key={winner.id} className="text-center">{winner.name}</div>)}
          </Fragment>
        ))}
      </div>
    </>
  )
}
