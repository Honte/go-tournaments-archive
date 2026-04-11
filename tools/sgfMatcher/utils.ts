import slugify from 'slugify';
import type { Color } from './types';

export function normalizePlayerName(name: string): string {
  return slugify(name, { lower: true, strict: true, replacement: '' });
}

export function normalizeLocalGameId(gameId: string): string {
  return gameId
    .split('-')
    .map(Number)
    .sort((a, b) => a - b)
    .join('-');
}

export function flipColor(color: Color): Color {
  return color ? (color === 'black' ? 'white' : 'black') : undefined;
}
