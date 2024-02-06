import { FaMedal } from 'react-icons/fa6';
import { getTranslator } from '@/i18n/translator';
import { H1 } from '@/components/ui/h1';
import { PlayerLink } from '@/components/ui/playerLink';
import { FullStatsLink } from '@/components/fullStatsLink';

export function Medalists({ stats, translations }) {
  const t = getTranslator(translations)

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.medalists')}</H1>
      <table className="w-full text-center border-collapse">
        <thead className="border-b-gray-300 border-b">
        <tr className="text-xl">
          <th></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="#fece43" title={t('medals.gold')}/></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="silver" title={t('medals.silver')}/></th>
          <th className="p-1 px-2"><FaMedal className="inline" fill="#CD7F32" title={t('medals.bronze')}/></th>
        </tr>
        </thead>
        <tbody>
        {stats.winners.map((winner) => (
          <tr key={winner.name} className="even:bg-gray-200 hover:bg-gray-300">
            <td className="text-left p-1"><PlayerLink player={winner} translations={translations}>{winner.name}</PlayerLink></td>
            <td>{winner.medals[0].length}</td>
            <td>{winner.medals[1].length}</td>
            <td>{winner.medals[2].length}</td>
          </tr>
        ))}
        </tbody>
      </table>

      <FullStatsLink translations={translations}/>
    </div>
  )
}
