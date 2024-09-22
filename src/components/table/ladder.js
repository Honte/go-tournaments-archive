'use client';

import { getTranslator } from '@/i18n/translator';
import { GameCell } from '@/components/gameCell';
import { PlayerLink } from '@/components/ui/playerLink';
import { withHighlighter } from '@/libs/higlighter';

export function TableLadder({ stage, players, games, translations }) {
  const t = getTranslator(translations);
  const { table, rounds, playoffs } = stage;
  const playoffsColumns = playoffs.length ? Math.max(...table.map((p) => p.playoffs.length)) : 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5"
             ref={withHighlighter}>
        <thead className="border-b-gray-300 border-b">
        <tr className="text-center">
          <th className="p-1">{t('table.place')}</th>
          <th className="p-1 text-left">{t('table.name')}</th>
          <th className="p-1">{t('table.rank')}</th>
          {rounds.map((round, index) => <th className="p-1" key={index}>{t('table.round', index + 1)}</th>)}
          {playoffsColumns > 0 ? <th className="p-1" colSpan={playoffsColumns}>{t('table.playoffs')}</th> : ''}
        </tr>
        </thead>
        <tbody>
        {table.map((player, i) => (
          <tr key={player.id} className="text-center even:bg-gray-200 !cursor-default">
            <td className="p-1">{(i === 0 || player.place !== table[i - 1].place) ? player.place : ''}</td>
            <td className="p-1 text-left">
              <PlayerLink player={players[player.id]} translations={translations}>
                {players[player.id].name}
              </PlayerLink>
            </td>
            <td className="p-1">{players[player.id].rank}</td>
            {player.games.map((game, index) => game ?
              <GameCell as="td" key={index} entry={game} games={games} players={players}/> : <td key={index}/>)}
            {playoffsColumns > 0 ?
              <PlayoffGames playoffs={player.playoffs} games={games} players={players} cols={playoffsColumns}/> : ''}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

function PlayoffGames({ games, players, cols, playoffs }) {
  if (!playoffs?.length) {
    return <td colSpan={cols}/>;
  }

  const cells = playoffs.map((game) => ({
    entry: game,
    colspan: 1
  }));

  if (playoffs.length < cols) {
    cells[cells.length - 1].colspan = 1 + (cols - playoffs.length);
  }

  return (
    <>
      {cells.map(({ entry, colspan }, index) =>
        <GameCell as="td" key={index} entry={entry} games={games} players={players} colSpan={colspan}/>
      )}
    </>
  );
}
