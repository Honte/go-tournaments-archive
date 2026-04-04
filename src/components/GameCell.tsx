import type { Game, IndexedTablePlayerGame, Player } from '@/schema/data';
import type { JSX } from 'react';
import { GamePopoverTrigger } from '@/components/GamePopoverTrigger';

type GameCellProps = {
  entry: IndexedTablePlayerGame;
  games: Record<string, Game>;
  players: Record<string, Player>;
  as: keyof JSX.IntrinsicElements;
  colSpan?: number;
};

export function GameCell({ entry, games, players, as, ...props }: GameCellProps) {
  return (
    <GamePopoverTrigger as={as} game={games[entry.game]} players={players} {...props}>
      {getResult(entry)}
    </GamePopoverTrigger>
  );
}

function getResult(entry: IndexedTablePlayerGame) {
  if (entry.opponent === 'BYE') {
    return entry.won ? '++' : '--';
  }

  return `${entry.index}${entry.won ? '+' : '-'}${entry.result === '!' ? '!' : ''}`;
}
