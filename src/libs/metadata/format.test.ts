import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatCount, formatDisplayDomain, getYearSpan, resolveMetadataBase } from './format';

describe('metadata format helpers', () => {
  it('resolves metadataBase and formats display domains cleanly', () => {
    assert.equal(resolveMetadataBase('https://eurogofed.org/')?.href, 'https://eurogofed.org/');
    assert.equal(resolveMetadataBase(''), undefined);
    assert.equal(resolveMetadataBase('not-a-url'), undefined);
    assert.equal(formatDisplayDomain('https://www.eurogofed.org/', '/archives', 'egc'), 'eurogofed.org/archives/egc');
    assert.equal(formatDisplayDomain('https://mp.go.art.pl'), 'mp.go.art.pl');
    assert.equal(formatDisplayDomain(undefined, '/archives', 'egc'), undefined);
  });

  it('pluralizes Polish and English counts accurately', () => {
    assert.equal(formatCount(1, 'editions', 'pl'), '1 edycja');
    assert.equal(formatCount(2, 'editions', 'pl'), '2 edycje');
    assert.equal(formatCount(5, 'editions', 'pl'), '5 edycji');
    assert.equal(formatCount(12, 'editions', 'pl'), '12 edycji');
    assert.equal(formatCount(22, 'editions', 'pl'), '22 edycje');
    assert.equal(formatCount(1, 'pairs', 'pl'), '1 para');
    assert.equal(formatCount(4, 'pairs', 'pl'), '4 pary');
    assert.equal(formatCount(5, 'pairs', 'pl'), '5 par');
    assert.equal(formatCount(1, 'sgfs', 'en'), '1 SGF game record');
    assert.equal(formatCount(42, 'sgfs', 'en'), '42 SGF game records');
  });

  it('formats calendar year spans and omits non-calendar season numbers', () => {
    assert.equal(getYearSpan([]), undefined);
    assert.equal(getYearSpan([2025]), '2025');
    assert.equal(getYearSpan([2025, 1995, 2010]), '1995–2025');
    assert.equal(getYearSpan([1, 2, 7]), undefined);
  });
});
