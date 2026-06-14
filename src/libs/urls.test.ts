import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  countryStatsUrl,
  faviconUrl,
  gameSgfUrl,
  gameThumbUrl,
  gamesZipUrl,
  i18nUrl,
  playerStatsUrl,
  rawGameSgfUrl,
  sitemapUrl,
} from './urls';

describe('URLs', () => {
  it('leaves URLs unprefixed for empty and root base paths', () => {
    assert.equal(faviconUrl(undefined), '/favicon.svg');
    assert.equal(faviconUrl(''), '/favicon.svg');
    assert.equal(faviconUrl('/'), '/favicon.svg');
  });

  it('normalizes raw base path values when building URLs', () => {
    assert.equal(i18nUrl('archive', 'pl'), '/archive/data/i18n/pl.json');
    assert.equal(i18nUrl('/archive', 'pl'), '/archive/data/i18n/pl.json');
    assert.equal(i18nUrl('/archive/', 'pl'), '/archive/data/i18n/pl.json');
  });

  it('supports event-like base paths', () => {
    assert.equal(playerStatsUrl('/archive/pgc', 'jan-kowalski'), '/archive/pgc/data/stats/player/jan-kowalski.json');
    assert.equal(sitemapUrl('/archive/pgc', 'en'), '/archive/pgc/data/sitemap/en.json');
  });

  it('does not double-prefix already-prefixed paths', () => {
    assert.equal(gameSgfUrl('/archive', '/archive/sgf/2024/game.sgf'), '/archive/sgf/2024/game.sgf');
    assert.equal(gamesZipUrl('/archive', '2024'), '/archive/sgf/2024.zip');
  });

  it('preserves external and protocol-relative paths', () => {
    assert.equal(gameSgfUrl('/archive', 'https://example.com/game.sgf'), 'https://example.com/game.sgf');
    assert.equal(gameSgfUrl('/archive', '//example.com/game.sgf'), '//example.com/game.sgf');
  });

  it('normalizes dynamic endpoint values', () => {
    assert.equal(countryStatsUrl('/archive', 'PL'), '/archive/data/stats/country/pl.json');
    assert.equal(rawGameSgfUrl('/archive', '/sgf/2024/game.sgf'), '/archive/sgf/2024/game.raw.sgf');
    assert.equal(gameThumbUrl('/archive', '/sgf/2024/game.jpg'), '/archive/sgf/2024/game.jpg');
    assert.equal(gameThumbUrl('/archive', undefined), undefined);
  });
});
