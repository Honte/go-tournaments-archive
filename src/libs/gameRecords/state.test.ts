import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deriveGameBrowserModel } from './model';
import { getGameGroupEligibility, normalizeGameBrowserState } from './state';
import { createGames, state } from './testFixtures';

describe('dependent normalization, sorting, and grouping', () => {
  const games = createGames();

  it('clears structurally invalid dependents but keeps a valid country-anchored opponent country', () => {
    const invalid = normalizeGameBrowserState(
      games,
      state({ player: 'a', country: 'FR', opponent: 'e', opponentCountry: 'PL' })
    );
    const countryAnchored = normalizeGameBrowserState(
      games,
      state({ country: 'PL', opponent: 'b', opponentCountry: 'DE' })
    );

    assert.equal(invalid.player, 'a');
    assert.equal(invalid.country, undefined);
    assert.equal(invalid.opponent, undefined);
    assert.equal(invalid.opponentCountry, undefined);
    assert.equal(countryAnchored.opponent, undefined);
    assert.equal(countryAnchored.opponentCountry, 'DE');
  });

  it('sorts stably by moves and by contiguous rank gap', () => {
    const byMoves = deriveGameBrowserModel(games, state({ sort: 'moves-desc' }));
    const byGap = deriveGameBrowserModel(games, state({ sort: 'rank-gap-asc' }));

    assert.deepEqual(
      byMoves.games.map((game) => game.sgf),
      ['g3.sgf', 'g2.sgf', 'g4.sgf', 'g1.sgf']
    );
    assert.deepEqual(
      byGap.games.map((game) => game.sgf),
      ['g4.sgf', 'g3.sgf', 'g1.sgf', 'g2.sgf']
    );
  });

  it('exposes only eligible grouping and groups sorted cards without duplication', () => {
    assert.deepEqual(getGameGroupEligibility(state({ player: 'a' })), {
      opponentPlayer: true,
      opponentCountry: true,
      countryPlayer: false,
      category: false,
    });
    assert.deepEqual(getGameGroupEligibility(state({ player: 'a', opponent: 'b' })), {
      opponentPlayer: false,
      opponentCountry: false,
      countryPlayer: false,
      category: false,
    });
    assert.deepEqual(getGameGroupEligibility(state({ country: 'PL' })), {
      opponentPlayer: true,
      opponentCountry: true,
      countryPlayer: true,
      category: false,
    });

    const byOpponent = deriveGameBrowserModel(games, state({ player: 'a', group: 'opponent-player' }));
    const byCountry = deriveGameBrowserModel(games, state({ country: 'PL', group: 'opponent-country' }));
    const byCountryPlayer = deriveGameBrowserModel(games, state({ country: 'PL', group: 'country-player' }));
    const byYear = deriveGameBrowserModel(games, state({ group: 'year' }));
    const invalidGroup = deriveGameBrowserModel(games, state({ player: 'a', opponent: 'b', group: 'opponent-player' }));

    assert.deepEqual(
      byOpponent.groups.map((group) => [group.label, group.games.length]),
      [
        ['Bob', 2],
        ['Carol', 1],
      ]
    );
    assert.deepEqual(
      byCountry.groups.map((group) => [group.key, group.games.length]),
      [
        ['DE', 2],
        ['PL', 1],
      ]
    );
    assert.equal(byCountry.groups.flatMap((group) => group.games).length, byCountry.filteredCount);
    assert.deepEqual(
      byCountryPlayer.groups.map((group) => [group.label, group.games.length]),
      [
        ['Alice New', 2],
        ['Dan, Eve', 1],
      ]
    );
    assert.deepEqual(
      byYear.groups.map((group) => group.label),
      ['2023', '2022', '2021', '2020']
    );
    assert.equal(invalidGroup.state.group, 'none');
  });

  it('groups category records when categories are available', () => {
    const categorized = createGames().map((record, index) => ({
      ...record,
      category: index % 2 === 0 ? 'junior' : 'open',
    }));
    const model = deriveGameBrowserModel(categorized, state({ group: 'category' }), {
      categoriesEnabled: true,
      categoryLabel: (category) => category.toUpperCase(),
    });

    assert.equal(getGameGroupEligibility(state(), true, true).category, true);
    assert.deepEqual(
      model.groups.map((group) => [group.label, group.games.length]),
      [
        ['JUNIOR', 2],
        ['OPEN', 2],
      ]
    );
  });

  it('clears category grouping when a category is selected', () => {
    const categorized = createGames().map((record, index) => ({
      ...record,
      category: index % 2 === 0 ? 'junior' : 'open',
    }));
    const model = deriveGameBrowserModel(categorized, state({ category: 'junior', group: 'category' }), {
      categoriesEnabled: true,
    });

    assert.equal(getGameGroupEligibility(state({ category: 'junior' }), true, true).category, false);
    assert.equal(model.state.group, 'none');
    assert.deepEqual(
      model.groups.flatMap((group) => group.games).map((game) => game.sgf),
      ['g3.sgf', 'g1.sgf']
    );
  });
});
