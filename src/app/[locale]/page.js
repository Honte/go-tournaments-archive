import { Fragment } from 'react';
import Link from 'next/link';

export default function Home({ params: { locale }}) {
  const years = [];

  for (let i = 1979; i <= 2023; i++) {
    years.push({
      year: i,
      winners: [
        'Player Surname'.slice(0, 5 + ~~(Math.random() * 10)),
        'Other Player',
        'Almost First-longnamed'
      ]
    });
  }

  return (
    <>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">Medaliści Mistrzostw Polski</h1>
      <div className="grid grid-cols-pgc my-3 gap-1 items-center">
        {years.map(({ year, winners}) => (
          <Fragment key={year}>
            <Link href={`/${locale}/${year}`} className="text-xl font-bold text-pgc-primary underline hover:text-pgc-hover">{year}</Link>
            {winners.map((winner) => <div key={winner} className="text-center">{winner}</div>)}
          </Fragment>
        ))}
      </div>
    </>
  )
}
