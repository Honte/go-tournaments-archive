'use client';

import type { Game, Participant, RoundRobinTableStage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getParticipantName, isPair } from '@/libs/participants';
import { GamePopoverTrigger } from '@/components/GamePopoverTrigger';
import { PlayerCell } from '@/components/ui/PlayerCell';

type TableWithoutRoundsProps = {
  event: EventContext;
  stage: RoundRobinTableStage;
  players: Record<string, Participant>;
  games: Record<string, Game>;
  translations: Translations;
};

export function TableWithoutRounds({ event, stage, players, games, translations }: TableWithoutRoundsProps) {
  const t = getTranslator(translations);
  const { table } = stage;
  const showRank = table.some((result) => players[result.id].rank);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            {showRank && <th className="p-1">{t('table.rank')}</th>}
            {table.map((player, index) => (
              <th className="p-1" key={index} title={getParticipantName(players[player.id])}>
                {shorten(getParticipantName(players[player.id]))}
              </th>
            ))}
            <th className="p-1">{t('breakers.wins')}</th>
          </tr>
        </thead>
        <tbody>
          {table.map((result, i) => {
            const player = players[result.id];

            return (
              <tr key={result.id} className="text-center even:bg-archive-row-stripe">
                <td className="p-1">{i === 0 || result.place !== table[i - 1].place ? result.place : ''}</td>
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
                {table.map((p, index) => {
                  const entry = p !== result && result.games.find((g) => g.opponent === p.id);

                  return (
                    <td className="p-1" key={index}>
                      {p === result ? (
                        <>&ndash;</>
                      ) : entry ? (
                        <GamePopoverTrigger game={games[entry.game]} players={players} as="span">
                          {entry.unresolved ? '?' : entry.drawn ? '=' : entry.won ? '1' : '0'}
                        </GamePopoverTrigger>
                      ) : null}
                    </td>
                  );
                })}
                <td className="p-1">{result.score}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function shorten(name: string) {
  return name
    .split(' ')
    .map((s) => `${s[0].toUpperCase()}.`)
    .join(' ');
}
