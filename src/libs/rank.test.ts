import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getRankValue } from '@/libs/rank';

describe('rank normalization', () => {
  it('uses a contiguous kyu, dan, and professional rank ladder', () => {
    assert.equal(getRankValue('1d')! - getRankValue('1k')!, 1);
    assert.equal(getRankValue('1p')! - getRankValue('9d')!, 1);
    assert.equal(getRankValue('3D'), getRankValue('3d'));
    assert.equal(getRankValue('unranked'), 0);
  });
});
