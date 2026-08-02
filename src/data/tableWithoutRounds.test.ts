import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game, Player } from '@/schema/data';
import { createTableWithoutRounds } from './tableWithoutRounds';

describe('createTableWithoutRounds jigo scoring', () => {
  it('awards half a point to both players', () => {
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
    const players: Record<string, Player> = {
      a: { id: 'a', name: 'Alice' },
      b: { id: 'b', name: 'Bob' },
    };

    const table = createTableWithoutRounds({ games: ['draw'], gamesMap: games, playersMap: players });

    assert.deepEqual(
      table.map((player) => player.score),
      [0.5, 0.5]
    );
    assert.ok(table.every((player) => player.games[0].drawn));
  });
});
