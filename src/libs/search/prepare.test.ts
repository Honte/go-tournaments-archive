import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventContext } from '@/schema/event';
import type { SearchIndex } from '@/schema/search';
import type { Translations } from '@/i18n/consts';
import en from '@/i18n/en.json';
import pl from '@/i18n/pl.json';
import { prepareSearchOptions } from './prepare';
import { findSearchResults } from './ranking';

const event = {
  id: 'test',
  locales: ['en'],
  prefix: 'test',
  basePath: '/archives',
} satisfies EventContext;

const translations: Translations = { ...en, locale: 'en' };

describe('search option preparation', () => {
  it('expands country terms into tournaments and players without duplicating localized names in their tuples', () => {
    const index: SearchIndex = {
      tournaments: [[2025, 'Mistrzostwa Polski', 'Warszawa', 'PL']],
      players: [['jnowak', 'Jan Nowak', 0, 'PL']],
      countries: [['PL', 'Polska', 3]],
    };
    const options = prepareSearchOptions(index, event, { ...pl, locale: 'pl' });
    const results = findSearchResults(options, 'Polska', 'pl');

    assert.ok(results.some((result) => result.value === 'tournament:2025:0'));
    assert.ok(results.some((result) => result.value === 'player:jnowak:0'));
    assert.ok(results.some((result) => result.value === 'country:PL:0'));
    assert.ok(findSearchResults(options, 'PL', 'pl').some((result) => result.normalizedId === 'jnowak'));
  });

  it('adds the games destination only for players with counted SGF records', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [],
        players: [
          ['a', 'Alice', 3, 'PL'],
          ['b', 'Bob', 0, null],
        ],
      },
      event,
      translations
    );

    assert.equal(options[0].gamesHref, '/test/en/stats/games?player=a');
    assert.equal(options[0].gamesLabel, '3 games');
    assert.equal(options[1].gamesHref, undefined);
    assert.equal(options[1].gamesLabel, undefined);
  });

  it('adds the games destination only for countries with counted SGF records', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [],
        players: [],
        countries: [
          ['PL', 'Poland', 3],
          ['DE', 'Germany', 0],
        ],
      },
      event,
      translations
    );

    assert.equal(options[0].gamesHref, '/test/en/stats/games?country=PL');
    assert.equal(options[0].gamesLabel, '3 games');
    assert.equal(options[1].gamesHref, undefined);
    assert.equal(options[1].gamesLabel, undefined);
  });

  it('prepares complete localized content and routes for every result type', () => {
    const index: SearchIndex = {
      tournaments: [[2025, 'Open', 'Warsaw', 'PL']],
      players: [['a b', 'Alice', 3, 'PL']],
      countries: [['PL', 'Poland', 3]],
      categories: [['women', 'Women', 'female']],
    };

    for (const [locale, dictionary, typeNames, gamesLabel] of [
      ['en', en, ['Country', 'Tournament', 'Player', 'Category'], '3 games'],
      ['pl', pl, ['Kraj', 'Turniej', 'Zawodnik', 'Kategoria'], '3 gier'],
    ] as const) {
      for (const prefix of ['test', undefined]) {
        const options = prepareSearchOptions(index, { ...event, prefix }, { ...dictionary, locale });
        const root = prefix ? `/${prefix}/${locale}` : `/${locale}`;

        assert.deepEqual(
          options.map(({ value, primary, secondary, label, href, gamesHref, gamesLabel }) => ({
            value,
            primary,
            secondary,
            label,
            href,
            gamesHref,
            gamesLabel,
          })),
          [
            {
              value: 'country:PL:0',
              primary: 'Poland (PL)',
              secondary: typeNames[0],
              label: `Poland (PL) ${typeNames[0]} ${gamesLabel}`,
              href: `${root}/stats/country/pl`,
              gamesHref: `${root}/stats/games?country=PL`,
              gamesLabel,
            },
            {
              value: 'tournament:2025:0',
              primary: '2025, Open',
              secondary: `${typeNames[1]}, Warsaw, Poland`,
              label: `2025, Open ${typeNames[1]}, Warsaw, Poland`,
              href: `${root}/2025`,
              gamesHref: undefined,
              gamesLabel: undefined,
            },
            {
              value: 'player:a b:0',
              primary: 'Alice (PL)',
              secondary: typeNames[2],
              label: `Alice (PL) ${typeNames[2]} ${gamesLabel}`,
              href: `${root}/stats/a b`,
              gamesHref: `${root}/stats/games?player=a%20b`,
              gamesLabel,
            },
            {
              value: 'category:women:0',
              primary: 'Women',
              secondary: typeNames[3],
              label: `Women ${typeNames[3]}`,
              href: `${root}/category/women`,
              gamesHref: undefined,
              gamesLabel: undefined,
            },
          ]
        );
        assert.equal(findSearchResults(options, 'female', locale)[0], options[3]);
      }
    }
  });

  it('omits unavailable metadata and falls back to country codes', () => {
    const options = prepareSearchOptions(
      {
        tournaments: [
          [2025, '', null, null],
          [2024, 'Open', null, 'DE'],
        ],
        players: [['a', 'Alice', 0, null]],
      },
      event,
      translations
    );

    assert.deepEqual(
      options.map(({ primary, secondary, label, gamesHref, gamesLabel }) => [
        primary,
        secondary,
        label,
        gamesHref,
        gamesLabel,
      ]),
      [
        ['2025', 'Tournament', '2025 Tournament', undefined, undefined],
        ['2024, Open', 'Tournament, DE', '2024, Open Tournament, DE', undefined, undefined],
        ['Alice', 'Player', 'Alice Player', undefined, undefined],
      ]
    );
    assert.equal(findSearchResults(options, 'DE', 'en')[0], options[1]);
  });
});
