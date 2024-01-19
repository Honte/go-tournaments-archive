import { GamePopoverTrigger } from '@/components/gamePopover';

export function GameCell({ entry, games, players, as }) {
  return (
    <GamePopoverTrigger as={as} game={games[entry.game]} players={players}>{getResult(entry)}</GamePopoverTrigger>
  )
}

function getResult(entry) {
  if (entry.opponent === 'BYE') {
    return entry.won ? '++' : '--';
  }

  return `${entry.index}${entry.won ? '+' : '-'}`;
}
