import type { StatsPlayer } from '@/schema/data';
import { FaMedal } from 'react-icons/fa6';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStatsLink } from '@/components/AllPlayersStatsLink';
import { H1 } from '@/components/ui/H1';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

type MedalistsProps = {
  players: StatsPlayer[];
  translations: Translations;
};

export function Medalists({ players, translations }: MedalistsProps) {
  const t = getTranslator(translations);

  return (
    <div>
      <H1 className="mb-0.5">{t('stats.medalists')}</H1>
      <table className="w-full text-center border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-xl">
            <th></th>
            <th className="p-1 px-2">
              <FaMedal className="inline" fill="#fece43" title={t('medals.gold')} />
            </th>
            <th className="p-1 px-2">
              <FaMedal className="inline" fill="silver" title={t('medals.silver')} />
            </th>
            <th className="p-1 px-2">
              <FaMedal className="inline" fill="#CD7F32" title={t('medals.bronze')} />
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((winner) => (
            <tr key={winner.name} className="even:bg-gray-200 hover:bg-gray-300">
              <td className="text-left p-1">
                <PlayerLink playerId={winner.id} locale={translations.locale}>
                  <PlayerName player={winner} includeRank={false} />
                </PlayerLink>
              </td>
              <td>{winner.medals[0].length}</td>
              <td>{winner.medals[1].length}</td>
              <td>{winner.medals[2].length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AllPlayersStatsLink translations={translations} />
    </div>
  );
}
