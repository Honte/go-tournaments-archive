'use client';

import { Breaker } from '@/components/Breaker';
import { GameCell } from '@/components/GameCell';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { withHighlighter } from '@/libs/higlighter';
import { getTranslator } from '@/i18n/translator';

export function TableLeague({ stage, players, games, translations }) {
  const t = getTranslator(translations);
  const { breakers, table, rounds } = stage;
  const visibleBreakers = breakers.filter((breaker) => breaker !== 'direct' && breaker !== 'rank');

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5"
        ref={withHighlighter}
      >
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {rounds.map((round, index) => (
              <th className="p-1" key={index}>
                {t('table.round', index + 1)}
              </th>
            ))}
            {visibleBreakers.map((breaker, index) => (
              <th className="p-1" key={index}>
                <Breaker translations={translations} breaker={breaker} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((player, i) => (
            <tr key={player.id} className="text-center even:bg-gray-200 cursor-default!">
              <td className="p-1">{i === 0 || player.place !== table[i - 1].place ? player.place : ''}</td>
              <td className="p-1 text-left">
                <PlayerLink player={players[player.id]} translations={translations}>
                  {players[player.id].name}
                </PlayerLink>
              </td>
              <td className="p-1">{players[player.id].rank}</td>
              {player.games.map((game, index) =>
                game ? (
                  <GameCell as="td" key={index} entry={game} games={games} players={players} />
                ) : (
                  <td key={index}>&ndash;</td>
                )
              )}
              {visibleBreakers.map((breaker) => (
                <td className="p-1" key={breaker}>
                  {player[breaker]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
