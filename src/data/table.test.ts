import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Breaker, type Game, type Player } from '@/schema/data';
import { createTable } from './table';

describe('createTable jigo scoring', () => {
  it('awards half a win, includes SOS, and awards no SODOS', () => {
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

    const table = createTable({
      gamesMap: games,
      playersMap: players,
      rounds: [['draw']],
      breakers: [Breaker.WINS, Breaker.SOS, Breaker.SODOS, Breaker.DIRECT_MATCH],
    });

    for (const player of table) {
      assert.equal(player.breakers.wins, 0.5);
      assert.equal(player.breakers.sos, 0.5);
      assert.equal(player.breakers.sodos, 0);
      assert.equal(player.games[0]?.drawn, true);
    }
    assert.equal(table[0].place, table[1].place);
  });
});
