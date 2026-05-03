import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createEndpoints } from './endpoints';
import { normalizeBasePath } from '@/basePath';

describe('normalizeBasePath', () => {
  it('normalizes empty and root values to an empty base path', () => {
    assert.equal(normalizeBasePath(undefined), '');
    assert.equal(normalizeBasePath(''), '');
    assert.equal(normalizeBasePath('/'), '');
  });

  it('normalizes path values with a single leading slash and no trailing slash', () => {
    assert.equal(normalizeBasePath('archive'), '/archive');
    assert.equal(normalizeBasePath('/archive'), '/archive');
    assert.equal(normalizeBasePath('/archive/'), '/archive');
  });
});

describe('FrontendEndpoints', () => {
  const endpoints = createEndpoints({
    basePath: '/archive',
    domain: 'https://example.org/',
  });

  it('adds basePath to JSON endpoints', () => {
    assert.equal(endpoints.I18N('pl'), '/archive/data/i18n/pl.json');
    assert.equal(endpoints.PLAYER_STATS('jan-kowalski'), '/archive/data/stats/player/jan-kowalski.json');
    assert.equal(endpoints.COUNTRY_STATS('PL'), '/archive/data/stats/country/pl.json');
    assert.equal(endpoints.SITEMAP('en'), '/archive/data/sitemap/en.json');
  });

  it('adds domain and basePath to game paths', () => {
    assert.equal(endpoints.GAME_FILE('/sgf/2025/game.sgf'), 'https://example.org/archive/sgf/2025/game.sgf');
  });
});
