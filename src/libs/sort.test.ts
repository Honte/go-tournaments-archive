import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Player } from '@/schema/data';
import {
  createCountryColumnSorter,
  createDateRangeColumnSorter,
  createLocaleColumnSorter,
  createPlayersSorter,
  createPodiumColumnSorter,
  sortTableStats,
} from '@/libs/sort';

const player = (id: string, name = id): Player => ({ id, name });

describe('sort utilities', () => {
  it('sorts table stats according to medal hierarchy, best place, and participation', () => {
    const statsA = {
      gold: 2,
      silver: 1,
      bronze: 0,
      bestPlace: 1,
      attended: 5,
      won: 10,
      games: 15,
      drawn: 0,
      lost: 5,
      wonPercent: 0.66,
      unresolved: 0,
    };
    const statsB = {
      gold: 1,
      silver: 3,
      bronze: 2,
      bestPlace: 1,
      attended: 6,
      won: 12,
      games: 18,
      drawn: 0,
      lost: 6,
      wonPercent: 0.66,
      unresolved: 0,
    };

    assert.ok(sortTableStats(statsA, statsB) < 0);
    assert.ok(sortTableStats(statsB, statsA) > 0);
  });

  it('sorts players by surname, then full name, then id', () => {
    const p1 = player('1', 'Amy Alpha');
    const p2 = player('2', 'Zoe Alpha');
    const p3 = player('3', 'Aaron Zeta');
    const p4 = player('4', 'Jan van Dijk');

    const ascending = createPlayersSorter('en');
    assert.ok(ascending(p1, p2) < 0);
    assert.ok(ascending(p1, p3) < 0);
    assert.ok(ascending(p4, p3) < 0);

    const descending = createPlayersSorter('en', true);
    assert.ok(descending(p1, p2) > 0);
    assert.ok(descending(p3, p1) < 0);
  });

  it('sorts podium columns with missing values last in TanStack table format', () => {
    const sortFn = createPodiumColumnSorter('en');
    const rowA = { getValue: (id: string) => (id === 'gold' ? [player('z', 'Aaron Zeta')] : []) };
    const rowB = { getValue: (id: string) => (id === 'gold' ? [player('a', 'Amy Alpha')] : []) };
    const rowEmpty = { getValue: () => [] };

    assert.ok(sortFn(rowA as any, rowB as any, 'gold') > 0);
    assert.ok(sortFn(rowB as any, rowA as any, 'gold') < 0);
    assert.ok(sortFn(rowA as any, rowEmpty as any, 'gold') < 0);
    assert.ok(sortFn(rowEmpty as any, rowA as any, 'gold') > 0);
    assert.equal(sortFn(rowEmpty as any, rowEmpty as any, 'gold'), 0);
  });

  it('sorts country column by translated name with missing values last', () => {
    const labels: Record<string, string> = { AT: 'Austria', DE: 'Germany', PL: 'Poland' };
    const sortFn = createCountryColumnSorter((code) => labels[code] ?? code, 'en');

    const rowAT = { getValue: () => 'AT' };
    const rowDE = { getValue: () => 'DE' };
    const rowMissing = { getValue: () => undefined };

    assert.ok(sortFn(rowAT as any, rowDE as any, 'country') < 0);
    assert.ok(sortFn(rowDE as any, rowAT as any, 'country') > 0);
    assert.ok(sortFn(rowAT as any, rowMissing as any, 'country') < 0);
    assert.ok(sortFn(rowMissing as any, rowAT as any, 'country') > 0);
    assert.equal(sortFn(rowMissing as any, rowMissing as any, 'country'), 0);
  });

  it('sorts date range column chronologically with missing values last', () => {
    const sortFn = createDateRangeColumnSorter();

    const rowEarly = { original: { start: '2024-01-01', end: '2024-01-05' } };
    const rowLate = { original: { start: '2024-06-01', end: '2024-06-05' } };
    const rowMissing = { original: {} };

    assert.ok(sortFn(rowEarly as any, rowLate as any, 'dates') < 0);
    assert.ok(sortFn(rowLate as any, rowEarly as any, 'dates') > 0);
    assert.ok(sortFn(rowEarly as any, rowMissing as any, 'dates') < 0);
    assert.ok(sortFn(rowMissing as any, rowEarly as any, 'dates') > 0);
    assert.equal(sortFn(rowMissing as any, rowMissing as any, 'dates'), 0);
  });

  it('sorts locale strings with missing values last', () => {
    const sortFn = createLocaleColumnSorter('en');

    const rowA = { getValue: () => 'Berlin' };
    const rowB = { getValue: () => 'Warsaw' };
    const rowMissing = { getValue: () => undefined };

    assert.ok(sortFn(rowA as any, rowB as any, 'location') < 0);
    assert.ok(sortFn(rowB as any, rowA as any, 'location') > 0);
    assert.ok(sortFn(rowA as any, rowMissing as any, 'location') < 0);
    assert.ok(sortFn(rowMissing as any, rowA as any, 'location') > 0);
    assert.equal(sortFn(rowMissing as any, rowMissing as any, 'location'), 0);
  });
});
