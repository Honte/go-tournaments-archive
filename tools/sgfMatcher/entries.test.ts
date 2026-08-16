import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSgfEntryString } from './entries';

describe('buildSgfEntryString jigo', () => {
  it('writes the explicit YAML jigo syntax with the parsed black player', () => {
    assert.equal(
      buildSgfEntryString({
        home: 1,
        away: 2,
        black: 1,
        winner: null,
        result: '0',
        sgf: '2025/draw.sgf',
      }),
      '1-2 jigo black:1 sgf:2025/draw.sgf'
    );
  });

  it('replaces an existing black property instead of writing it twice during a forced rematch', () => {
    assert.equal(
      buildSgfEntryString({
        home: 1,
        away: 2,
        black: 1,
        winner: null,
        result: '0',
        sgf: '2025/draw.sgf',
        props: { black: '1', round: '4' },
      }),
      '1-2 jigo black:1 round:4 sgf:2025/draw.sgf'
    );
  });

  it('preserves an existing black property when the SGF has no player metadata', () => {
    assert.equal(
      buildSgfEntryString({
        home: 1,
        away: 2,
        winner: null,
        result: '0',
        sgf: '2025/draw.sgf',
        props: { black: '2' },
      }),
      '1-2 jigo black:2 sgf:2025/draw.sgf'
    );
  });
});
