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
});
