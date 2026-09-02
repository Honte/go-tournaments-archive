import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventData, EventDefinition } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { buildSearchIndex, createSearchEntry } from '@/data/search';

describe('search index generation', () => {
  it('stores only normalized terms that cannot be derived from the id or display name', () => {
    assert.deepEqual(createSearchEntry('jnowak', 'Jan Nowak', ['Jan Nowak']), ['jnowak', 'Jan Nowak']);
    assert.deepEqual(createSearchEntry('kzuk', 'Katarzyna Żuk', ['Katarzyna Żuk-Rybicka']), [
      'kzuk',
      'Katarzyna Żuk',
      'rybicka',
    ]);
    assert.deepEqual(createSearchEntry('alpha', 'Alpha', ['Łódź', 'Lodz', 'alpha-go']), [
      'alpha',
      'Alpha',
      'lodz',
      'go',
    ]);
  });

  it('builds localized tuples, referee terms, and compact SGF game counts', () => {
    const event = {
      id: 'test',
      locales: ['pl'],
      showCountry: true,
      categories: ['u18'],
    } satisfies EventDefinition;
    const translations = {
      locale: 'pl',
      country: { PL: 'Polska' },
      categories: {
        full: { u18: 'Kategoria U18' },
        short: { u18: 'U18' },
      },
    } as Translations;
    const data = {
      tournaments: [
        {
          year: 2025,
          name: { pl: 'Mistrzostwa Polski', en: 'Polish Championship' },
          location: 'Warszawa',
          country: 'PL',
          referee: 'Jan Kowalski',
          players: {
            localKzuk: { id: 'kzuk', country: 'PL' },
            localZno: { id: 'zno', country: 'PL' },
          },
          games: {
            sameCountry: {
              path: 'events/test/sgf/2025/same-country.sgf',
              props: { sgf: '2025/same-country.sgf' },
              players: [{ id: 'localKzuk' }, { id: 'localZno' }],
            },
            bye: {
              path: 'events/test/sgf/2025/bye.sgf',
              props: { sgf: '2025/bye.sgf' },
              players: [{ id: 'localKzuk' }, { id: 'BYE' }],
            },
          },
        },
      ],
      stats: {
        players: {
          kzuk: {
            id: 'kzuk',
            name: 'Katarzyna Żuk',
            country: ['PL'],
            results: [{ name: 'Katarzyna Żuk-Rybicka' }],
          },
          zno: {
            id: 'zno',
            name: 'Zofia Nowa',
            country: ['PL'],
            results: [{ name: 'Zofia Nowa' }],
          },
          BYE: {
            id: 'BYE',
            name: 'BYE',
            results: [],
          },
        },
        countries: { PL: { code: 'PL' } },
      },
    } as unknown as EventData;

    const index = buildSearchIndex(event, data, translations);

    assert.deepEqual(index.tournaments, [[2025, 'Mistrzostwa Polski', 'Warszawa', 'PL', 'jan', 'kowalski']]);
    assert.deepEqual(index.players, [
      ['kzuk', 'Katarzyna Żuk', 2, 'PL', 'rybicka'],
      ['zno', 'Zofia Nowa', 1, 'PL'],
    ]);
    assert.deepEqual(index.countries, [['PL', 'Polska', 2]]);
    assert.deepEqual(index.categories, [['u18', 'Kategoria U18']]);
  });

  it('omits optional country and category collections when unavailable', () => {
    const index = buildSearchIndex(
      { id: 'test', locales: ['en'] },
      {
        tournaments: [],
        stats: { players: {}, countries: {} },
      } as unknown as EventData,
      { locale: 'en' } as Translations
    );

    assert.deepEqual(index, { tournaments: [], players: [] });
  });
});
