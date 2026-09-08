import assert from 'node:assert/strict';
import { it } from 'node:test';
import { getGameStats } from './games';

it('counts only completed games and keeps unresolved results separate', () => {
  assert.deepEqual(
    getGameStats([{ won: true }, { won: false, drawn: true }, { won: false }, { won: false, unresolved: true }]),
    { games: 3, won: 1, drawn: 1, lost: 1, unresolved: 1, wonPercent: 1 / 3 }
  );
});

it('has no losses or win percentage for pending-only and empty game lists', () => {
  for (const games of [[], [{ won: false, unresolved: true }]]) {
    const stats = getGameStats(games);
    assert.equal(stats.games, 0);
    assert.equal(stats.lost, 0);
    assert.equal(stats.unresolved, games.length);
    assert.ok(Number.isNaN(stats.wonPercent));
  }
});
