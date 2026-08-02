import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseGame } from './games';

describe('parseGame', () => {
  it('parses case-insensitive jigo entries with properties', () => {
    const game = parseGame('aa-bb JiGo sgf:2025/game.sgf', 'game-id', 0);

    assert.equal(game.result, 'jigo');
    assert.equal(game.players[0].won, false);
    assert.equal(game.players[1].won, false);
    assert.equal(game.props.sgf, '2025/game.sgf');
  });

  it('rejects a winner that is not one of the players', () => {
    assert.throws(() => parseGame('aa-bb cc:B+R', 'game-id', 0), /Unrecognized game winner/);
  });

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
