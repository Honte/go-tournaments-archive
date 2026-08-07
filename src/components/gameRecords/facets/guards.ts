import type { GameResultType, GameWinner } from '@/libs/gameRecords';

export function isGameWinner(value: string): value is GameWinner {
  return (
    value === 'black' ||
    value === 'white' ||
    value === 'jigo' ||
    value === 'player' ||
    value === 'player-opponent' ||
    value === 'country' ||
    value === 'country-opponent'
  );
}

export function isGameResultType(value: string): value is GameResultType {
  return value === 'resignation' || value === 'points' || value === 'time' || value === 'other' || value === 'unknown';
}
