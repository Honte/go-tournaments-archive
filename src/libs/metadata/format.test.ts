import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Tournament } from '@/schema/data';
import { getTranslator } from '@/i18n/translator';
import {
  formatDisplayDomain,
  getEventDisplayName,
  getOpenGraphLocale,
  getSgfTournamentYears,
  getTournamentPodiumPlaces,
  getYearSpan,
  resolveMetadataBase,
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

  it('derives Open Graph locales dynamically via Intl.Locale with safe fallbacks', () => {
    assert.equal(getOpenGraphLocale('en'), 'en_US');
    assert.equal(getOpenGraphLocale('pl'), 'pl_PL');
    assert.equal(getOpenGraphLocale('de'), 'de_DE');
    assert.equal(getOpenGraphLocale('en-GB'), 'en_GB');
    assert.equal(getOpenGraphLocale('eo'), 'eo');
    assert.equal(getOpenGraphLocale('invalid_locale!'), 'invalid_locale!');
  });

  it('prefers site.eventName over site.name when eventName is defined', () => {
    const withEventName = getTranslator({
      locale: 'en',
      site: { name: 'WAGC Archive', eventName: 'World Amateur Go Championship' },
    } as never);
    const withoutEventName = getTranslator({
      locale: 'en',
      site: { name: 'European Go Congress Archive' },
    } as never);

    assert.equal(getEventDisplayName(withEventName), 'World Amateur Go Championship');
    assert.equal(getEventDisplayName(withoutEventName), 'European Go Congress Archive');
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
});
