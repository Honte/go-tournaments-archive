import { GamePopoverTrigger } from '@/components/gamePopover';

export function GameCell({ entry, games, players, as, ...props }) {
  return (
    <GamePopoverTrigger as={as} game={games[entry.game]} players={players} {...props}>
      {getResult(entry)}
    </GamePopoverTrigger>
  )
}

function getResult(entry) {
  if (entry.opponent === 'BYE') {
    return entry.won ? '++' : '--';
  }

  return `${entry.index}${entry.won ? '+' : '-'}${entry.result === '!' ? '!' : ''}`;
}
