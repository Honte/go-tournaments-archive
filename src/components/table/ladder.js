'use client';

import { getTranslator } from '@/i18n/translator';
import { GameCell } from '@/components/gameCell';
import { PlayerLink } from '@/components/ui/playerLink';
import attachHighlighter from 'go-results-highlighter/src/lib/wrapper';

import 'go-results-highlighter/dist/browser.css';

export function TableLadder({ stage, players, games, translations }) {
  const t = getTranslator(translations);
  const { table, rounds, playoffs } = stage;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5"
             ref={attachHighlighter}>
        <thead className="border-b-gray-300 border-b">
        <tr className="text-center">
          <th className="p-1">{t('table.place')}</th>
          <th className="p-1 text-left">{t('table.name')}</th>
          <th className="p-1">{t('table.rank')}</th>
          {rounds.map((round, index) => <th className="p-1" key={index}>{t('table.round', index + 1)}</th>)}
          {playoffs?.length ? <th className="p-1">{t('table.playoffs')}</th> : ''}
        </tr>
        </thead>
        <tbody>
        {table.map((player, i) => (
          <tr key={player.id} className="text-center even:bg-gray-200">
            <td className="p-1">{(i === 0 || player.place !== table[i - 1].place) ? player.place : ''}</td>
            <td className="p-1 text-left">
              <PlayerLink player={players[player.id]} translations={translations}>
                {players[player.id].name}
              </PlayerLink>
            </td>
            <td className="p-1">{players[player.id].rank}</td>
            {player.games.map((game, index) => game ?
              <GameCell as="td" key={index} entry={game} games={games} players={players}/> : <td key={index}/>)}
            {playoffs.length ? <td className="inline-flex gap-2">
              {player.playoffs.map((game, index) => <GameCell as="span" key={index} entry={game} games={games}
                                                              players={players}/>)}
            </td> : ''}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
