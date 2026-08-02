import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game } from '@/schema/data';
import { createFinalTable } from './final';

describe('createFinalTable jigo scoring', () => {
  it('records the game without increasing either win total', () => {
    const games: Record<string, Game> = {
      draw: {
        id: 'draw',
        stage: 0,
        players: [
          { id: 'a', won: false },
          { id: 'b', won: false },
        ],
        result: 'jigo',
        draw: true,
        props: {},
      },
    };

    const table = createFinalTable({ games: ['draw'], gamesMap: games, includePrevious: false });

    assert.deepEqual(
      table.map((player) => player.wins),
      [0, 0]
    );
    assert.ok(table.every((player) => player.games[0].drawn));
  });
});
