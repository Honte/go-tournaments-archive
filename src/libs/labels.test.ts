import assert from 'node:assert/strict';
import { it } from 'node:test';
import { getRankCountrySuffix } from './labels';

it('omits empty country collections and preserves rank formatting', () => {
  for (const country of [[], new Set<string>(), '', undefined, false] as const) {
    assert.equal(getRankCountrySuffix('3d', country), ' (3d)');
    assert.equal(getRankCountrySuffix(undefined, country), '');
  }
  assert.equal(getRankCountrySuffix('3d', ['PL', 'PL', 'CZ']), ', 3d (PL, CZ)');
  assert.equal(getRankCountrySuffix(false, 'PL'), ' (PL)');
});
