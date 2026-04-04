'use client';

import type { Game, Player, RoundRobinTableStage } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GamePopoverTrigger } from '@/components/GamePopoverTrigger';
import { PlayerLink } from '@/components/ui/PlayerLink';

type TableWithoutRoundsProps = {
  stage: RoundRobinTableStage;
  players: Record<string, Player>;
  games: Record<string, Game>;
  translations: Translations;
};

export function TableWithoutRounds({ stage, players, games, translations }: TableWithoutRoundsProps) {
  const t = getTranslator(translations);
  const { table } = stage;

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {table.map((player, index) => (
              <th className="p-1" key={index} title={players[player.id].name}>
                {shorten(players[player.id].name)}
              </th>
            ))}
            <th className="p-1">{t('breakers.wins')}</th>
          </tr>
        </thead>
        <tbody>
          {table.map((player, i) => (
            <tr key={player.id} className="text-center even:bg-gray-200">
              <td className="p-1">{i === 0 || player.place !== table[i - 1].place ? player.place : ''}</td>
              <td className="p-1 text-left">
                <PlayerLink player={players[player.id]} translations={translations}>
                  {players[player.id].name}
                </PlayerLink>
              </td>
              <td className="p-1">{players[player.id].rank}</td>
              {table.map((p, index) => {
                const entry = p !== player && player.games.find((g) => g.opponent === p.id);

                return (
                  <td className="p-1" key={index}>
                    {p === player ? (
                      <>&ndash;</>
                    ) : entry ? (
                      <GamePopoverTrigger game={games[entry.game]} players={players} as="span">
                        {entry.won ? '1' : '0'}
                      </GamePopoverTrigger>
                    ) : null}
                  </td>
                );
              })}
              <td className="p-1">{player.score}</td>
            </tr>
          ))}
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
