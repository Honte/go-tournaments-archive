import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseGame } from './games';

describe('parseGame', () => {
  it('parses SGF rotation props as numeric angles', () => {
    for (const angle of [0, 90, 180, 270] as const) {
      const game = parseGame(`aa-bb aa:B+R sgf:2025/game.sgf rotate:${angle}`, 'game-id', 0);

      assert.equal(game.rotation, angle);
    }
  });

  it('rejects unsupported SGF rotation props', () => {
    assert.throws(
      () => parseGame('aa-bb aa:B+R sgf:2025/game.sgf rotate:45', 'game-id', 0),
      /Unrecognized SGF rotation/
    );
  });
});
