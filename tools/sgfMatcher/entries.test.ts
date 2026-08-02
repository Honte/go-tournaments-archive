import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSgfEntryString } from './entries';

describe('buildSgfEntryString jigo', () => {
  it('writes the explicit YAML jigo syntax', () => {
    assert.equal(
      buildSgfEntryString({ black: 1, white: 2, winner: null, result: '0', sgf: '2025/draw.sgf' }),
      '1-2 jigo sgf:2025/draw.sgf'
    );
  });
});
