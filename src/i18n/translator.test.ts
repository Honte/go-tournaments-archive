import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator, translateOptional } from '@/i18n/translator';

const en = { ...JSON.parse(readFileSync('./src/i18n/en.json', 'utf-8')), locale: 'en' } as Translations;
const pl = { ...JSON.parse(readFileSync('./src/i18n/pl.json', 'utf-8')), locale: 'pl' } as Translations;

function createBaseTranslator(locale: Locale) {
  return getTranslator(locale === 'pl' ? pl : en);
}

describe('i18n translator (use-intl)', () => {
  it('interpolates named ICU parameters and preserves apostrophes', () => {
    const tEn = createBaseTranslator('en');
    const tPl = createBaseTranslator('pl');

    assert.equal(tEn('site.playerStatsTitle', { player: 'Cho Chikun' }), 'Cho Chikun - Stats');
    assert.equal(tEn('gamesFilter.opponentWinner', { player: 'Alice' }), "Alice's opponent");
    assert.equal(tEn('country.CI'), "Côte d'Ivoire");
    assert.equal(tPl('gamesFilter.count', { filtered: 12, total: 40 }), '12 z 40');
    assert.equal(tPl('gamesFilter.opponentWinner', { player: 'Alicja' }), 'Przeciwnik');
  });

  it('pluralizes Polish and English ICU count messages and standalone metric labels', () => {
    const tEn = createBaseTranslator('en');
    const tPl = createBaseTranslator('pl');

    assert.equal(tPl('counts.editions', { count: 1 }), '1 edycja');
    assert.equal(tPl('counts.editions', { count: 2 }), '2 edycje');
    assert.equal(tPl('counts.editions', { count: 5 }), '5 edycji');
    assert.equal(tPl('counts.editions', { count: 12 }), '12 edycji');
    assert.equal(tPl('counts.editions', { count: 22 }), '22 edycje');
    assert.equal(tPl('counts.pairs', { count: 1 }), '1 para');
    assert.equal(tPl('counts.pairs', { count: 4 }), '4 pary');
    assert.equal(tPl('counts.pairs', { count: 5 }), '5 par');
    assert.equal(tEn('counts.sgfs', { count: 1 }), '1 SGF game record');
    assert.equal(tEn('counts.sgfs', { count: 42 }), '42 SGF game records');
    assert.equal(tPl('socialCard.statsMetrics.editions', { count: 1 }), 'edycja');
    assert.equal(tPl('socialCard.statsMetrics.editions', { count: 2 }), 'edycje');
    assert.equal(tPl('socialCard.statsMetrics.players', { count: 5 }), 'graczy');
    assert.equal(tEn('socialCard.statsMetrics.games', { count: 1 }), 'game');
    assert.equal(tEn('socialCard.statsMetrics.games', { count: 140 }), 'games');
  });

  it('returns undefined from translateOptional when key is missing or is a namespace object', () => {
    const t = getTranslator({ locale: 'en', site: { acronym: 'WAGC' } } as never);

    assert.equal(translateOptional(t, 'site.acronym'), 'WAGC');
    assert.equal(translateOptional(t, 'site'), undefined);
    assert.equal(translateOptional(t, 'country.ZZ'), undefined);
  });

  it('caches translator instances per translations object', () => {
    assert.equal(getTranslator(en), getTranslator(en));
    assert.notEqual(getTranslator(en), getTranslator(pl));
  });
});
