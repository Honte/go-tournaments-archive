'use client';

import type { Game, IndexedTablePlayerGame, LadderTableStage, Participant } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { isPair } from '@/libs/participants';
import { GameCell } from '@/components/GameCell';
import { GoResultsTable } from '@/components/table/GoResultsTable';
import { PlayerCell } from '@/components/ui/PlayerCell';

type TableLadderProps = {
  event: EventContext;
  stage: LadderTableStage;
  players: Record<string, Participant>;
  games: Record<string, Game>;
  translations: Translations;
};

export function TableLadder({ event, stage, players, games, translations }: TableLadderProps) {
  const t = getTranslator(translations);
  const { table, rounds, playoffs } = stage;
  const playoffsColumns = playoffs.length ? Math.max(...table.map((p) => p.playoffs.length)) : 0;
  const showRank = table.some((result) => players[result.id].rank);

  return (
    <div className="w-full overflow-x-auto">
      <GoResultsTable className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            {showRank && <th className="p-1">{t('table.rank')}</th>}
            {rounds.map((round, index) => (
              <th className="p-1" key={index}>
                {t('table.round', String(index + 1))}
              </th>
            ))}
            {playoffsColumns > 0 ? (
              <th className="p-1" colSpan={playoffsColumns}>
                {t('table.playoffs')}
              </th>
            ) : (
              ''
            )}
          </tr>
        </thead>
        <tbody>
          {table.map((result, i) => {
            const player = players[result.id];

            return (
              <tr key={result.id} className="text-center even:bg-archive-row-stripe cursor-default!">
                <td className="p-1">
                  {i > 0 && result.place === table[i - 1].place ? `(${result.index})` : result.index}
                </td>
                <td className="p-1 text-left">
                  <PlayerCell
                    event={event}
                    player={player}
                    locale={translations.locale}
                    showLink={isPair(player) || player.hasStats}
                    showCountry={event.showCountry}
                    showRank={isPair(player)}
                  />
                </td>
                {showRank && <td className="p-1">{player.rank}</td>}
                {result.games.map((game, index) =>
                  game ? (
                    <GameCell as="td" key={index} entry={game} games={games} players={players} />
                  ) : (
                    <td key={index} />
                  )
                )}
                {playoffsColumns > 0 ? (
                  <PlayoffGames playoffs={result.playoffs} games={games} players={players} cols={playoffsColumns} />
                ) : (
                  ''
                )}
              </tr>
            );
          })}
        </tbody>
      </GoResultsTable>
    </div>
  );
}

type PlayoffGamesProps = {
  games: Record<string, Game>;
  players: Record<string, Participant>;
  cols: number;
  playoffs: IndexedTablePlayerGame[];
};

function PlayoffGames({ games, players, cols, playoffs }: PlayoffGamesProps) {
  if (!playoffs?.length) {
    return <td colSpan={cols} />;
  }

  const cells = playoffs.map((game) => ({
    entry: game,
    colspan: 1,
  }));

  if (playoffs.length < cols) {
    cells[cells.length - 1].colspan = 1 + (cols - playoffs.length);
  }

  return (
    <>
      {cells.map(({ entry, colspan }, index) => (
        <GameCell as="td" key={index} entry={entry} games={games} players={players} colSpan={colspan} />
      ))}
    </>
  );
}
