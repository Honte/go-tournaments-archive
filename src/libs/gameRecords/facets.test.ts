import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deriveGameBrowserModel } from './model';
import { createGames, game, player, state, toCounts } from './testFixtures';

describe('game facets', () => {
  const games = createGames();

  it('builds reciprocal multi-country opponent facets with would-match counts', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a' }));

    assert.deepEqual(toCounts(model.facets.country.options), { DE: 1, PL: 2 });
    assert.deepEqual(toCounts(model.facets.opponent.options), { b: 2, c: 1 });
    assert.deepEqual(toCounts(model.facets.opponentCountry.options), { DE: 2, FR: 1 });

    const alice = model.facets.player.options.find((option) => option.value === 'a');
    assert.equal(alice?.label, 'Alice New');
    assert.equal(alice?.count, 3);
    assert.match(alice?.search ?? '', /Alice Old/);
  });

  it('sorts player facets by live count, then label, while countries remain alphabetical', () => {
    const facetGames = [
      game('order-1', 2020, player('a', 'Alice', '1d', 'PL'), player('b', 'Bob', '1d', 'DE'), {
        result: 'B+R',
        winner: 'black',
        moves: 100,
      }),
      game('order-2', 2021, player('z', 'Zoe', '1d', 'FR'), player('b', 'Bob', '1d', 'DE'), {
        result: 'W+R',
        winner: 'white',
        moves: 100,
      }),
      game('order-3', 2022, player('z', 'Zoe', '1d', 'FR'), player('c', 'Carol', '1d', 'PL'), {
        result: 'B+R',
        winner: 'black',
        moves: 100,
      }),
    ];
    const model = deriveGameBrowserModel(facetGames, state());

    assert.deepEqual(
      model.facets.player.options.map((option) => [option.value, option.count]),
      [
        ['b', 2],
        ['z', 2],
        ['a', 1],
        ['c', 1],
      ]
    );
    assert.deepEqual(
      model.facets.country.options.map((option) => option.value),
      ['DE', 'FR', 'PL']
    );
  });

  it('uses self-excluding counts and counts a same-country game only once', () => {
    const playerModel = deriveGameBrowserModel(games, state({ player: 'a', country: 'PL' }));
    const countryModel = deriveGameBrowserModel(games, state({ country: 'PL' }));

    assert.deepEqual(toCounts(playerModel.facets.country.options), { DE: 1, PL: 2 });
    assert.deepEqual(toCounts(countryModel.facets.opponentCountry.options), { DE: 2, PL: 1 });
    assert.equal(countryModel.filteredCount, 3);
  });

  it('retains a structurally valid selected option with a zero live count', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', opponent: 'b', results: ['time'] }));
    const selectedOpponent = model.facets.opponent.options.find((option) => option.value === 'b');

    assert.equal(model.state.opponent, 'b');
    assert.equal(model.filteredCount, 0);
    assert.equal(selectedOpponent?.count, 0);
    assert.equal(toCounts(model.facets.opponent.options).c, 1);
  });

  it('updates year and media counts from the current filter state', () => {
    const playerModel = deriveGameBrowserModel(games, state({ player: 'a', years: [2023] }));
    const mediaOptions = deriveGameBrowserModel(games, state({ player: 'a' }));
    const selectedMedia = deriveGameBrowserModel(games, state({ player: 'a', media: ['ogs'] }));

    assert.deepEqual(toCounts(playerModel.facets.year.options), { 2020: 1, 2021: 1, 2023: 1 });
    assert.deepEqual(mediaOptions.facets.media, { ogs: 2, yt: 2, ai: 0 });
    assert.deepEqual(selectedMedia.facets.media, { ogs: 2, yt: 1, ai: 0 });
  });

  it('builds result and winner options from the full focal context', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', years: [2020], media: ['ogs'] }));

    assert.deepEqual(model.facets.result, { resignation: 1, points: 1, time: 1, other: 0, unknown: 0 });
    assert.deepEqual(model.facets.winner, {
      black: 1,
      white: 2,
      jigo: 0,
      player: 3,
      'player-opponent': 0,
      country: 3,
      'country-opponent': 0,
    });
  });

  it('updates komi counts from the current orientation filter state', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', country: 'PL' }));
    const selected = deriveGameBrowserModel(games, state({ player: 'a', country: 'PL', komi: ['0.5'] }));

    assert.equal(model.filteredCount, 2);
    assert.deepEqual(toCounts(model.facets.komi.options), { '0.5': 1, '6.5': 1 });
    assert.deepEqual(toCounts(selected.facets.komi.options), { '0.5': 1, '6.5': 1 });
  });

  it('only hides komi when every unfiltered game has the same value', () => {
    const filtered = deriveGameBrowserModel(games, state({ years: [2020] }));
    const uniformGames = games.map((game) => ({ ...game, komi: 6.5 }));

    assert.equal(filtered.facets.komi.visible, true);
    assert.equal(deriveGameBrowserModel(uniformGames, state()).facets.komi.visible, false);
  });

  it('builds self-excluding winner counts for colors and focal roles', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', winner: 'black' }));

    assert.deepEqual(model.facets.winner, {
      black: 1,
      white: 2,
      jigo: 0,
      player: 3,
      'player-opponent': 0,
      country: 3,
      'country-opponent': 0,
    });
  });

  it('retains a selected year with zero matches from unrelated filters', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', years: [2020], results: ['time'] }));

    assert.equal(model.filteredCount, 0);
    assert.deepEqual(toCounts(model.facets.year.options), { 2020: 0, 2021: 1 });
  });

  it('filters and facets categories only when category data is enabled', () => {
    const categorized = createGames().map((record, index) => ({
      ...record,
      category: index < 2 ? 'junior' : 'open',
    }));
    const model = deriveGameBrowserModel(categorized, state({ player: 'a', category: 'junior' }), {
      categoriesEnabled: true,
      categoryLabel: (category) => category.toUpperCase(),
    });

    assert.deepEqual(toCounts(model.facets.category.options), { junior: 2, open: 1 });
    assert.deepEqual(
      model.games.map((record) => record.sgf),
      ['g2.sgf', 'g1.sgf']
    );
    assert.equal(model.facets.category.options[0]?.label, 'JUNIOR');
  });
});
