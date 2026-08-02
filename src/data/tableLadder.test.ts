import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game } from '@/schema/data';
import { createLadderTable } from './tableLadder';

describe('createLadderTable jigo handling', () => {
  it('records the draw without changing the configured order', () => {
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

    const table = createLadderTable({
      order: ['b', 'a'],
      rounds: [['draw']],
      playoffs: [],
      gamesMap: games,
    });

    assert.deepEqual(
      table.map((player) => player.id),
      ['b', 'a']
    );
    assert.ok(table.every((player) => player.games[0]?.drawn));
  });
});
