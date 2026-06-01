import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTournamentSgfZipPath } from '@/data/sgfs';

describe('getTournamentSgfZipPath', () => {
  it('keeps flat year SGFs as basenames', () => {
    assert.equal(getTournamentSgfZipPath('/sgf/2025/1-A-B.sgf'), '1-A-B.sgf');
  });

  it('prefixes nested SGFs with the subfolder name', () => {
    assert.equal(getTournamentSgfZipPath('/sgf/2025/top8/5-A-B.sgf'), 'top8-5-A-B.sgf');
    assert.equal(getTournamentSgfZipPath('/sgf/2025/final/1-A-B.sgf'), 'final-1-A-B.sgf');
  });

  it('accepts paths without the SGF route prefix', () => {
    assert.equal(getTournamentSgfZipPath('2025/top8/5-A-B.sgf'), 'top8-5-A-B.sgf');
  });

  it('normalizes Windows separators', () => {
    assert.equal(getTournamentSgfZipPath('2025\\top8\\5-A-B.sgf'), 'top8-5-A-B.sgf');
  });
});
