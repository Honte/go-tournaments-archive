import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { CountryStats, PlayerGame, PlayerStageResult } from '@/schema/data';
import { getCountryEventRows } from '@/components/stats/CountryEvents';

describe('getCountryEventRows', () => {
  it('counts unique SGFs per participation and retains its category when the category column is hidden', () => {
    const stage = createStage(1, { u16: 1 });
    stage.games = [
      { ...createGame(true), props: { sgf: '2025/one.sgf' } },
      { ...createGame(false), props: { sgf: '2025/one.sgf' } },
      createGame(false),
    ];
    const country = createCountry([createResult('alice', 1, [stage, createStage(2)])]);
    const rows = getRows(country, false, false);
    assert.deepEqual(
      rows.map(({ sgfs, category }) => ({ sgfs, category })),
      [
        { sgfs: 1, category: 'u16' },
        { sgfs: 0, category: undefined },
      ]
    );
  });

  it('keeps only the player with the best overall place', () => {
    const country = createCountry([
      createResult('alice', 1, [createStage(1)]),
      createResult('bob', 2, [createStage(2)]),
    ]);

    const rows = getRows(country, true, false);

    assert.deepEqual(
      rows.map((row) => row.id),
      ['alice']
    );
  });

  it('keeps all players tied at the best overall place and preserves their stage rows', () => {
    const country = createCountry([
      createResult('alice', 1, [createStage(1), createStage(3)]),
      createResult('bob', 1, [createStage(1)]),
      createResult('carol', 2, [createStage(2)]),
    ]);

    const rows = getRows(country, true, false);

    assert.deepEqual(
      rows.map((row) => row.id),
      ['alice', 'alice', 'bob']
    );
  });

  it('keeps independent best performers and ties for each category', () => {
    const country = createCountry([
      createResult('alice', 3, [createStage(3, { u12: 1, u16: 2 })]),
      createResult('bob', 2, [createStage(2, { u12: 2, u16: 1 })]),
      createResult('carol', 4, [createStage(4, { u16: 1 })]),
      createResult('dan', 5, [createStage(5, { u12: 3 })]),
    ]);

    const rows = getRows(country, true, true);

    assert.deepEqual(
      rows.map((row) => row.id),
      ['alice', 'bob', 'carol']
    );
  });

  it('does not treat unconfirmed category placements as best', () => {
    const country = createCountry([
      createResult('alice', 1, [createStage(1, { u12: '?' })]),
      createResult('bob', 2, [createStage(2, { u16: 1 })]),
    ]);

    const rows = getRows(country, true, true);

    assert.deepEqual(
      rows.map((row) => row.id),
      ['bob']
    );
  });

  it('returns every existing stage row when the filter is disabled', () => {
    const country = createCountry([
      createResult('alice', 1, [createStage(1, { u12: '?' }), createStage(2)]),
      createResult('bob', 2, [createStage(2, { u16: 1 })]),
    ]);

    const rows = getRows(country, false, true);

    assert.deepEqual(
      rows.map((row) => row.id),
      ['alice', 'alice', 'bob']
    );
  });
});

function getRows(country: CountryStats, showBestOnly: boolean, hasCategories: boolean) {
  return getCountryEventRows({
    country,
    showBestOnly,
    hasCategories,
    showCategories: hasCategories,
  });
}

function createCountry(results: CountryStats['years'][number]['results']): CountryStats {
  const bestPlace = Math.min(...results.map((result) => result.place));

  return {
    code: 'PL',
    totalSgfs: 0,
    medals: [[], [], []],
    categoriesMedals: {},
    score: 0,
    bestPlace,
    totalGames: 0,
    totalWon: 0,
    totalDrawn: 0,
    totalUnresolved: 0,
    years: {
      2025: {
        year: 2025,
        bestPlace,
        totalGames: 0,
        totalWon: 0,
        totalDrawn: 0,
        totalUnresolved: 0,
        results,
      },
    },
  };
}

function createResult(id: string, place: number, stages: PlayerStageResult[]) {
  return {
    id,
    year: 2025,
    place,
    name: id,
    stages,
  };
}

function createStage(place: number, categories?: Record<string, number | '?'>): PlayerStageResult {
  return {
    type: 'league',
    place,
    categories,
    games: [createGame(true), createGame(false)],
  };
}

function createGame(won: boolean): PlayerGame {
  return {
    id: 'opponent',
    won,
    result: won ? 'B+R' : 'W+R',
  };
}
