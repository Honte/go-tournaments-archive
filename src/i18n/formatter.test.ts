import assert from 'node:assert/strict';
import test from 'node:test';
import { getFormatter } from '@/i18n/formatter';

test('formats counts and percentages by locale', () => {
  const en = getFormatter('en');
  const pl = getFormatter('pl');

  assert.equal(en.toCount(1_234_567), '1,234,567');
  assert.equal(en.toPercentage(0.1234), '12.3%');
  assert.equal(pl.toCount(1_234_567), '1\u00a0234\u00a0567');
  assert.equal(pl.toPercentage(0.1234), '12,3%');
});

test('formats table cells and replaces non-finite values', () => {
  const { toNumericCell, toPercentageCell } = getFormatter('en');
  const cell = (value: number) => ({ getValue: () => value });

  assert.equal(toNumericCell(cell(1_234)), '1,234');
  assert.equal(toPercentageCell(cell(2 / 3)), '66.7%');
  assert.equal(toNumericCell(cell(NaN)), '–');
  assert.equal(toPercentageCell(cell(Infinity)), '–');
});
