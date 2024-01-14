import { notFound } from 'next/navigation';
import { YearsNavigation } from '@/components/yearsNavigation';

export default function Edition({ params: { year, locale }}) {
  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  const years = [];
  for (let i = 1979; i <= 2023; i++) {
    years.push(i);
  }

  const tournament = {
    details: {
      Miejsce: 'Warszawa',
      Start: '26.12.2031',
      Koniec: '12.12.2051',
      Reguły: 'Japoński',
      Komi: '6.5'
    },
    winners: [
      'Adam ADASDASD 4d',
      'Tomek Aasdfgsdfgsdfg 20k',
      'Barry Ksdfsdfsd 2d',
    ]
  }

  return (
    <>
      <YearsNavigation locale={locale} years={years} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Informacje</h2>
          <dl className="grid grid-cols-2">
            {Object.entries(tournament.details).map(([label, response]) => (
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
            {tournament.winners.map((winner) => <li key={winner} className="my-1">{winner}</li>)}
          </ol>
        </div>
      </div>

      <div className="my-4">
        <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Wyniki</h2>

        <div className="w-full overflow-auto">
        <table className="min-w-full table-auto">
          <tbody>
          <tr>
            <th> M</th>
            <th>Player</th>
            <th>GR</th>
            <th> 1.</th>
            <th> 2.</th>
            <th> 3.</th>
            <th> 4.</th>
            <th> 5.</th>
            <th>Pt</th>
            <th>SODOS</th>
          </tr>

          <tr>
            <td> 1.</td>
            <td align="left">Leszek Sołdan</td>
            <td> 4D</td>
            <td> 4+</td>
            <td> 6+</td>
            <td> 2+</td>
            <td> 5+</td>
            <td> 3+</td>
            <td> 5</td>
            <td> 10</td>
          </tr>
          <tr>
            <td> 2.</td>
            <td align="left">Janusz Kraszek</td>
            <td> 5D</td>
            <td> 6+</td>
            <td> 3+</td>
            <td> 1-</td>
            <td> 4+</td>
            <td> 5+</td>
            <td> 4</td>
            <td> 6</td>
          </tr>
          <tr>
            <td> 3.</td>
            <td align="left">Robert Zabłocki</td>
            <td> 4D</td>
            <td> 5+</td>
            <td> 2-</td>
            <td> 4+</td>
            <td> 6+</td>
            <td> 1-</td>
            <td> 3</td>
            <td> 3</td>
          </tr>
          <tr>
            <td> 4.</td>
            <td align="left">Roman Pozaroszczyk</td>
            <td> 1k</td>
            <td> 1-</td>
            <td> 5+</td>
            <td> 3-</td>
            <td> 2-</td>
            <td> 6+</td>
            <td> 2</td>
            <td> 1</td>
          </tr>
          <tr>
            <td> 5.</td>
            <td align="left">Krzysztof Urtnowski</td>
            <td> 1D</td>
            <td> 3-</td>
            <td> 4-</td>
            <td> 6+</td>
            <td> 1-</td>
            <td> 2-</td>
            <td> 1</td>
            <td> 0</td>
          </tr>
          <tr>
            <td> 6.</td>
            <td align="left">Włodzimierz Grudziński</td>
            <td> 1D</td>
            <td> 2-</td>
            <td> 1-</td>
            <td> 5-</td>
            <td> 3-</td>
            <td> 4-</td>
            <td> 0</td>
            <td> 0</td>
          </tr>
          </tbody>
        </table>
        </div>
      </div>
    </>
  )
}
