import { getTranslations } from '@/i18n/server';
import { FaMedal } from 'react-icons/fa6';

export async function Medalists({ stats, locale }) {
  const t = await getTranslations(locale)

  return (
    <div>
      <h1 className="text-2xl font-bold pb-1 mt-3 mb-0.5 border-b-pgc-dark border-b-2">{t('stats.medalists')}</h1>
      <table className="w-full text-center border-collapse">
        <thead className="border-b-gray-300 border-b">
        <tr className="text-xl">
          <th></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="#fece43"/></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="silver"/></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="#CD7F32"/></th>
        </tr>
        </thead>
        <tbody>
        {stats.winners.map((winner) => (
          <tr key={winner.name} className="even:bg-gray-200">
            <td className="text-left p-1">{winner.name}</td>
            <td>{winner.medals[0]}</td>
            <td>{winner.medals[1]}</td>
            <td>{winner.medals[2]}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
