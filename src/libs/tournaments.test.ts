import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game, LeagueStage, Player, Tournament } from '@/schema/data';
import { buildTournamentRows, sortPodium, sortTournamentRows, type TournamentRow } from '@/libs/tournaments';
import { tournamentsUrl } from '@/libs/urls';

const player = (id: string, name = id): Player => ({ id, name });
function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return { year: 2025, id: 2025, top: [], players: {}, stages: [], games: {}, hasSgfs: false, ...overrides };
}
function stage(members: [string, Record<string, number | '?'>?][], category?: string): LeagueStage {
  return {
    type: 'league',
    category,
    rounds: [],
    table: members.map(([id, categories], index) => ({
      id,
      categories,
      index,
      place: index + 1,
      games: [],
      won: [],
      drawn: [],
      lost: [],
      breakers: { wins: 0, sos: 0, sodos: 0, sosos: 0, starting: 0, rank: 0 },
    })),
  };
}
function game(id: string, stage: number, a: string, b: string, sgf?: string): Game {
  return {
    id,
    stage,
    players: [
      { id: a, won: true },
      { id: b, won: false },
    ],
    result: 'B+R',
    draw: false,
    props: { sgf },
  };
}
function row(overrides: Partial<TournamentRow> = {}): TournamentRow {
  return { year: 2025, gold: [], silver: [], bronze: [], players: 0, stages: 0, games: 0, sgfs: 0, ...overrides };
}
const countryLabel = (code: string) => ({ DE: 'Germany', AT: 'Austria', CH: 'Switzerland' })[code] ?? code;

describe('tournament table rows', () => {
  it('excludes announcements and counts players and games once, excluding BYEs', () => {
    const source = tournament({
      players: { a: player('a'), alias: player('a'), b: player('b'), BYE: player('BYE') },
      stages: [stage([['a'], ['b']]), stage([['a'], ['b']])],
      top: [['a', 'b'], [], ['missing']],
      games: { g1: game('g1', 0, 'a', 'b', '1.sgf'), g2: game('g2', 1, 'a', 'b'), bye: game('bye', 1, 'a', 'BYE') },
    });
    const [result] = buildTournamentRows([source, tournament({ announcement: true, year: 2026 })]);
    assert.equal(buildTournamentRows([source, tournament({ announcement: true })]).length, 1);
    assert.deepEqual([result.players, result.stages, result.games, result.sgfs], [2, 2, 2, 1]);
    assert.deepEqual(
      result.gold.map((p) => p.id),
      ['a', 'b']
    );
    assert.deepEqual(result.bronze, []);
    assert.deepEqual(source.top, [['a', 'b'], [], ['missing']]);
  });

  it('uses stage-local category membership, including uncertain and overlapping categories', () => {
    const source = tournament({
      players: { a: player('a'), b: player('b'), c: player('c') },
      stages: [
        stage([
          ['a', { u12: 1, u16: 1 }],
          ['b', { u12: '?' }],
          ['c', { u16: 2 }],
        ]),
        stage([['a'], ['c']], 'u16'),
      ],
      categoriesTop: { u12: [['a']], u16: [['a'], ['c']] },
      games: {
        both: game('both', 0, 'a', 'b'),
        cross: game('cross', 0, 'b', 'c'),
        older: game('older', 1, 'a', 'c'),
        bye: game('bye', 0, 'a', 'BYE'),
      },
    });
    const [younger] = buildTournamentRows([source], 'u12');
    const [older] = buildTournamentRows([source], 'u16');
    assert.deepEqual([younger.players, younger.stages, younger.games], [2, 1, 2]);
    assert.deepEqual([older.players, older.stages, older.games], [2, 2, 3]);
    assert.deepEqual(buildTournamentRows([source], 'u21'), []);
  });

  it('retains podium-only category editions and their recorded participants', () => {
    const [result] = buildTournamentRows(
      [
        tournament({
          players: { local: player('canonical', 'Alice Nowak') },
          categoriesTop: { u12: [['local']] },
        }),
      ],
      'u12'
    );
    assert.equal(result.players, 1);
    assert.equal(result.gold[0].id, 'canonical');
    assert.equal(result.stages, 0);
  });

  it('creates event-scoped URLs in both route modes', () => {
    const event = { id: 'pgc', locales: ['en'] as ['en'] };
    assert.equal(tournamentsUrl(event, 'en'), '/en/tournaments');
    assert.equal(tournamentsUrl({ ...event, prefix: 'mp' }, 'pl'), '/mp/pl/tournaments');
  });
});

describe('tournament sorting', () => {
  it('sorts surnames and shared places in both directions without changing the input', () => {
    const players = [
      player('z', 'Aaron Zeta'),
      player('b', 'Zoe Alpha'),
      player('a', 'Amy Alpha'),
      player('v', 'Jan van Dijk'),
    ];
    assert.deepEqual(
      sortPodium(players, 'en').map((p) => p.id),
      ['a', 'b', 'v', 'z']
    );
    assert.deepEqual(
      sortPodium(players, 'en', true).map((p) => p.id),
      ['z', 'v', 'b', 'a']
    );
    assert.equal(players[0].id, 'z');
    const rows = [
      row({ year: 2024, gold: [players[0], players[2]] }),
      row({ year: 2023, gold: [player('m', 'Zoe Middle')] }),
      row({ year: 2025 }),
    ];
    assert.deepEqual(
      sortTournamentRows(rows, 'gold', false, 'en', countryLabel).map((r) => r.year),
      [2024, 2023, 2025]
    );
    assert.deepEqual(
      sortTournamentRows(rows, 'gold', true, 'en', countryLabel).map((r) => r.year),
      [2024, 2023, 2025]
    );
  });

  it('uses later shared-place names to break ties, then newest year', () => {
    const a = player('a', 'Zoe Alpha');
    const rows = [
      row({ year: 2020, gold: [a, player('c', 'Amy Charlie')] }),
      row({ year: 2021, gold: [a, player('b', 'Zoe Beta')] }),
      row({ year: 2022, gold: [a, player('b', 'Zoe Beta')] }),
    ];
    assert.deepEqual(
      sortTournamentRows(rows, 'gold', false, 'en', countryLabel).map((r) => r.year),
      [2022, 2021, 2020]
    );
  });

  it('sorts numbers numerically, dates chronologically, and countries by translated label', () => {
    const rows = [
      row({ year: 2021, games: 10, start: '2021-02-01', end: '2021-02-04', country: 'CH' }),
      row({ year: 2022, games: 2, start: '2021-02-01', end: '2021-02-03', country: 'AT' }),
      row({ year: 2023, games: 0, country: 'DE' }),
    ];
    assert.deepEqual(
      sortTournamentRows(rows, 'games', false, 'en', countryLabel).map((r) => r.games),
      [0, 2, 10]
    );
    assert.deepEqual(
      sortTournamentRows(rows, 'dates', false, 'en', countryLabel).map((r) => r.year),
      [2022, 2021, 2023]
    );
    assert.deepEqual(
      sortTournamentRows(rows, 'dates', true, 'en', countryLabel).map((r) => r.year),
      [2021, 2022, 2023]
    );
    assert.deepEqual(
      sortTournamentRows(rows, 'country', false, 'en', countryLabel).map((r) => r.country),
      ['AT', 'DE', 'CH']
    );
    const places = [row({ year: 2021, location: 'Berlin' }), row({ year: 2022 })];
    assert.equal(sortTournamentRows(places, 'location', true, 'en', countryLabel)[1].year, 2022);
  });
});
