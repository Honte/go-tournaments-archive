import Link from 'next/link';
import { getTranslator } from '@/i18n/translator';

export function Winners({tournaments, translations, className}) {
  const t = getTranslator(translations);

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold pb-1 my-3 border-b-pgc-dark border-b-2">{t('winners.title')}</h1>
      <table className="w-full border-collapse">
        <thead className="border-b-gray-300 border-b">
        <tr>
          <th>{t('winners.year')}</th>
          <th>{t('winners.first')}</th>
          <th>{t('winners.second')}</th>
          <th>{t('winners.third')}</th>
        </tr>
        </thead>
        <tbody>
        {tournaments.map(({year, top, players}) => (
          <tr key={year} className="text-center even:bg-gray-200">
            <td className="p-1">
              <Link className="sm:text-xl font-bold text-pgc-primary underline hover:text-pgc-hover"
                    href={`/${translations.locale}/${year}`}>
                {year}
              </Link>
            </td>
            {top.map((winner, index) => (
              <td className="p-1" key={index}>
                {winner.split(',').map((id) => `${players[id].name} (${players[id].rank})`).join(', ')}
              </td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
