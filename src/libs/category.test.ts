import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { CategoryPlayer } from '@/schema/data';
import { getCategoryCountryMedalists } from '@/libs/category';

it('counts country medals once per pair using the pair country', () => {
  const results: CategoryPlayer[] = [
    { id: 'a', name: 'A', rank: '', country: 'PL', place: 1, participant: { id: 'ab', country: 'PL' } },
    { id: 'b', name: 'B', rank: '', country: 'PL', place: 1, participant: { id: 'ab', country: 'PL' } },
    { id: 'c', name: 'C', rank: '', country: 'PL', place: 2, participant: { id: 'cd', country: 'XX' } },
    { id: 'd', name: 'D', rank: '', country: 'DE', place: 2, participant: { id: 'cd', country: 'XX' } },
    { id: 'e', name: 'E', rank: '', country: 'CZ', place: 3 },
  ];

  const medalists = getCategoryCountryMedalists({ category: 'open', tournaments: [{ year: 2025, results }] });

  assert.deepEqual(medalists, [
    { country: 'PL', medals: [['2025'], [], []] },
    { country: 'XX', medals: [[], ['2025'], []] },
    { country: 'CZ', medals: [[], [], ['2025']] },
  ]);
});
