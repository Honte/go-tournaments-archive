import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventContext } from '@/schema/event';
import type { SearchIndex } from '@/schema/search';
import {
  findSearchResults,
  getSearchDestinations,
  normalizeSearchText,
  prepareSearchEntities,
  tokenizeSearchText,
} from '@/libs/search';
import { allGameStatsForCountryUrl, allGameStatsForPlayerUrl, searchIndexUrl } from '@/libs/urls';

const event = {
  id: 'test',
  locales: ['en'],
  prefix: 'test',
  basePath: '/archives',
} satisfies EventContext;

describe('archive search', () => {
  it('folds Latin letters without a local replacement table and preserves other scripts', () => {
    assert.equal(normalizeSearchText('ł ø đ ð þ æ œ ß'), 'l o d d th ae oe ss');
    assert.equal(normalizeSearchText('Ł Ø Đ Ð Þ Æ Œ ẞ'), 'l o d d th ae oe ss');
    assert.equal(normalizeSearchText('Ĳ ĳ Ŋ ŋ'), 'ij ij n n');
    assert.equal(normalizeSearchText('É e\u0301'), 'e e');
    assert.equal(normalizeSearchText('  Jan—Nowak\t\n Żuk!  '), 'jan nowak zuk');
    assert.equal(normalizeSearchText('张三 김민수 Кирилл'), '张三 김민수'.normalize('NFKD') + ' кирилл');
    assert.equal(normalizeSearchText('Ｆｕｌｌ ﬃ'), 'full ffi');
    assert.equal(normalizeSearchText('…'), '');
    assert.equal(normalizeSearchText(), '');
  });

  it('normalizes accents and punctuation into order-independent tokens', () => {
    assert.equal(normalizeSearchText('  Łódź—Żuk  '), 'lodz zuk');
    assert.deepEqual(tokenizeSearchText('Jan Nowak-Rybicki'), ['jan', 'nowak', 'rybicki']);

    const entities = prepareSearchEntities({
      tournaments: [],
      players: [['jnowak', 'Jan Nowak', 0, null]],
    });

    assert.equal(findSearchResults(entities, 'Nowa Jan', 'en')[0]?.navigationId, 'jnowak');
  });

  it('ranks exact matches before weaker matches and applies limited fuzzy matching', () => {
    const entities = prepareSearchEntities({
      tournaments: [],
      players: [
        ['nowak', 'Nowak', 0, null],
        ['jnowak', 'Jan Nowak', 0, null],
        ['nowski', 'Jan Nowski', 0, null],
      ],
    });

    assert.deepEqual(
      findSearchResults(entities, 'nowak', 'en').map((result) => result.navigationId),
      ['nowak', 'jnowak']
    );
    assert.equal(findSearchResults(entities, 'nowsk', 'en')[0]?.navigationId, 'nowski');
    assert.deepEqual(
      findSearchResults(entities, 'nowal', 'en').map((result) => result.navigationId),
      ['jnowak', 'nowak']
    );
    assert.deepEqual(findSearchResults(entities, 'xyz', 'en'), []);
    assert.deepEqual(
      findSearchResults(entities, 'now', 'en').map((result) => result.navigationId),
      ['nowak', 'jnowak', 'nowski']
    );
  });

  it('expands country terms into tournaments and players without duplicating localized names in their tuples', () => {
    const index: SearchIndex = {
      tournaments: [[2025, 'Mistrzostwa Polski', 'Warszawa', 'PL']],
      players: [['jnowak', 'Jan Nowak', 0, 'PL']],
      countries: [['PL', 'Polska', 3]],
    };
    const entities = prepareSearchEntities(index);
    const results = findSearchResults(entities, 'Polska', 'pl');

    assert.ok(results.some((result) => result.type === 'tournament' && result.navigationId === 2025));
    assert.ok(results.some((result) => result.type === 'player' && result.navigationId === 'jnowak'));
    assert.ok(results.some((result) => result.type === 'country' && result.navigationId === 'PL'));
    assert.ok(findSearchResults(entities, 'PL', 'pl').some((result) => result.navigationId === 'jnowak'));
  });

  it('adds the games destination only for players with counted SGF records', () => {
    const entities = prepareSearchEntities({
      tournaments: [],
      players: [
        ['a', 'Alice', 3, 'PL'],
        ['b', 'Bob', 0, null],
      ],
    });

    assert.deepEqual(
      getSearchDestinations(entities[0], event, 'en').map((destination) => destination.kind),
      ['player', 'player-games']
    );
    assert.deepEqual(
      getSearchDestinations(entities[1], event, 'en').map((destination) => destination.kind),
      ['player']
    );
  });

  it('adds the games destination only for countries with counted SGF records', () => {
    const entities = prepareSearchEntities({
      tournaments: [],
      players: [],
      countries: [
        ['PL', 'Poland', 3],
        ['DE', 'Germany', 0],
      ],
    });

    assert.deepEqual(
      getSearchDestinations(entities[0], event, 'en').map((destination) => destination.kind),
      ['country', 'country-games']
    );
    assert.deepEqual(
      getSearchDestinations(entities[1], event, 'en').map((destination) => destination.kind),
      ['country']
    );
  });

  it('limits matched entities before player destinations are expanded', () => {
    const entities = prepareSearchEntities({
      tournaments: [],
      players: Array.from({ length: 25 }, (_, index) => [`p${index}`, `Player ${index}`, 1, null]),
    });
    const results = findSearchResults(entities, 'player', 'en');
    const destinations = results.flatMap((result) => getSearchDestinations(result, event, 'en'));

    assert.equal(results.length, 20);
    assert.equal(destinations.length, 40);
  });

  it('builds base-path asset URLs and canonical game-filter URLs', () => {
    assert.equal(searchIndexUrl(event, 'en'), '/archives/data/test/search/en.json');
    assert.equal(allGameStatsForPlayerUrl(event, 'en', 'a b'), '/test/en/stats/games?player=a%20b');
    assert.equal(allGameStatsForCountryUrl(event, 'en', 'PL'), '/test/en/stats/games?country=PL');
  });
});
