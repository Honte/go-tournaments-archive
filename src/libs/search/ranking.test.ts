import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import en from '@/i18n/en.json';
import { prepareSearchOptions } from './prepare';
import { findSearchResults } from './ranking';

const event = {
  id: 'test',
  locales: ['en'],
  prefix: 'test',
  basePath: '/archives',
} satisfies EventContext;

const translations: Translations = { ...en, locale: 'en' };

describe('search result ranking', () => {
  it('matches tokens independently of their order', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [],
        players: [['jnowak', 'Jan Nowak', 0, null]],
      },
      event,
      translations
    );

    assert.equal(findSearchResults(options, 'Nowa Jan', 'en')[0]?.normalizedId, 'jnowak');
  });

  it('ranks exact matches before weaker matches and applies limited fuzzy matching', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [],
        players: [
          ['nowak', 'Nowak', 0, null],
          ['jnowak', 'Jan Nowak', 0, null],
          ['nowski', 'Jan Nowski', 0, null],
        ],
      },
      event,
      translations
    );

    assert.deepEqual(
      findSearchResults(options, 'nowak', 'en').map((result) => result.normalizedId),
      ['nowak', 'jnowak']
    );
    assert.equal(findSearchResults(options, 'nowsk', 'en')[0]?.normalizedId, 'nowski');
    assert.deepEqual(
      findSearchResults(options, 'nowal', 'en').map((result) => result.normalizedId),
      ['jnowak', 'nowak']
    );
    assert.deepEqual(findSearchResults(options, 'xyz', 'en'), []);
    assert.deepEqual(
      findSearchResults(options, 'now', 'en').map((result) => result.normalizedId),
      ['nowak', 'jnowak', 'nowski']
    );
  });

  it('limits matched options without counting their game links separately', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [],
        players: Array.from({ length: 25 }, (_, index) => [`p${index}`, `Player ${index}`, 1, null]),
      },
      event,
      translations
    );
    const results = findSearchResults(options, 'player', 'en');

    assert.equal(results.length, 20);
    assert.ok(results.every((option) => option.gamesHref));
    assert.equal(findSearchResults(options, 'player', 'en', 3).length, 3);
    assert.equal(findSearchResults(options, 'player', 'en', 0).length, 0);
  });

  it('returns the original options without mutation and sorts ties by display name then value', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [
          [2025, 'Open 2', null, null],
          [2024, 'Open 10', null, null],
        ],
        players: [
          ['z', 'Open 2', 0, null],
          ['a', 'Open 2', 0, null],
        ],
      },
      event,
      translations
    );
    const before = structuredClone(options);
    const results = findSearchResults(options, 'Open', 'en');

    assert.deepEqual(
      results.map(({ value }) => value),
      ['player:a:1', 'player:z:0', 'tournament:2025:0', 'tournament:2024:1']
    );
    assert.ok(results.every((option) => options.includes(option) && !('score' in option)));
    assert.deepEqual(options, before);
    for (const query of ['', '   ', '…']) {
      assert.deepEqual(findSearchResults(options, query, 'en'), []);
    }
    assert.deepEqual(findSearchResults([], 'Open', 'en'), []);
  });
});
