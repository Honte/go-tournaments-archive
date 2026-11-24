import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Tournament } from '@/schema/data';
import { getTranslator } from '@/i18n/translator';
import {
  formatCount,
  formatDisplayDomain,
  formatPluralNoun,
  getSgfTournamentYears,
  getTournamentPodiumPlaces,
  getYearSpan,
  resolveMetadataBase,
  translateOptional,
} from './format';

describe('metadata format helpers', () => {
  it('resolves metadataBase and formats display domains cleanly', () => {
    assert.equal(resolveMetadataBase('https://eurogofed.org/')?.href, 'https://eurogofed.org/');
    assert.equal(resolveMetadataBase(''), undefined);
    assert.equal(resolveMetadataBase('not-a-url'), undefined);
    assert.equal(formatDisplayDomain('https://www.eurogofed.org/', '/archives', 'egc'), 'eurogofed.org/archives/egc');
    assert.equal(formatDisplayDomain('https://mp.go.art.pl'), 'mp.go.art.pl');
    assert.equal(formatDisplayDomain(undefined, '/archives', 'egc'), undefined);
  });

  it('pluralizes Polish and English counts and standalone nouns accurately', () => {
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
    assert.equal(formatPluralNoun(1, 'editions', 'pl'), 'edycja');
    assert.equal(formatPluralNoun(2, 'editions', 'pl'), 'edycje');
    assert.equal(formatPluralNoun(5, 'players', 'pl'), 'graczy');
    assert.equal(formatPluralNoun(1, 'games', 'en'), 'game');
    assert.equal(formatPluralNoun(140, 'games', 'en'), 'games');
  });

  it('formats calendar year spans and extracts SGF tournament years excluding announcements', () => {
    assert.equal(getYearSpan([]), undefined);
    assert.equal(getYearSpan([2025]), '2025');
    assert.equal(getYearSpan([2025, 1995, 2010]), '1995–2025');
    assert.equal(getYearSpan([1, 2, 7]), undefined);

    const tournaments = [
      { year: 2023, hasSgfs: false },
      { year: 2024, hasSgfs: true },
      { year: 2025, hasSgfs: true },
      { year: 2026, hasSgfs: true, announcement: true },
    ] as Tournament[];
    assert.deepEqual(getSgfTournamentYears(tournaments), [2024, 2025]);
  });

  it('preserves explicit podium ranks when an earlier place is shared and leaves an empty slot', () => {
    const tournament = {
      top: [['p1', 'p2'], [], ['p3']],
      participants: {
        p1: { id: 'p1', name: 'Alice' },
        p2: { id: 'p2', name: 'Bob' },
        p3: { id: 'p3', name: 'Carol' },
      },
    } as unknown as Tournament;

    assert.deepEqual(getTournamentPodiumPlaces(tournament), [
      { rank: 1, names: 'Alice, Bob' },
      { rank: 3, names: 'Carol' },
    ]);
  });

  it('returns undefined from translateOptional when key is missing', () => {
    const t = getTranslator({ locale: 'en', site: { acronym: 'WAGC' } } as never);
    assert.equal(translateOptional(t, 'site.acronym'), 'WAGC');
    assert.equal(translateOptional(t, 'countries.ZZ'), undefined);
  });
});
