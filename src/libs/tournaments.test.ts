import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game, LeagueStage, Player, Tournament } from '@/schema/data';
import { buildTournamentRows, buildTournamentTables } from '@/libs/tournaments';
import { tournamentsUrl, tournamentTablesDataUrl } from '@/libs/urls';

const player = (id: string, name = id): Player => ({ id, name });
function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return { year: 2025, id: 2025, top: [], participants: {}, stages: [], games: {}, hasSgfs: false, ...overrides };
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
    props: { sgf },
  };
}

describe('tournament table rows', () => {
  it('passes raw dates without a formatted date label', () => {
    const [result] = buildTournamentRows([tournament({ start: '2025-06-01', end: '2025-06-02' })]);
    assert.equal(result.start, '2025-06-01');
    assert.equal(result.end, '2025-06-02');
    assert.equal('dates' in result, false);
  });

  it('excludes announcements and counts players and games once, excluding BYEs', () => {
    const source = tournament({
      participants: { a: player('a'), alias: player('a'), b: player('b'), BYE: player('BYE') },
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
      participants: { a: player('a'), b: player('b'), c: player('c') },
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
          participants: { local: player('canonical', 'Alice Nowak') },
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
    assert.equal(tournamentTablesDataUrl(event), '/data/tournaments-table.json');
    assert.equal(
      tournamentTablesDataUrl({ ...event, prefix: 'mp', basePath: '/archive' }),
      '/archive/data/mp/tournaments-table.json'
    );
  });
});

describe('tournament table payload', () => {
  const event = { id: 'test', locales: ['en'] as ['en'], generateSgfs: true };

  it('prepares only table rows and preserves SGF visibility from announcement editions', () => {
    const source = tournament({ participants: { a: player('a') }, top: [['a']] });
    const result = buildTournamentTables(event, [source, tournament({ announcement: true, hasSgfs: true })]);
    assert.deepEqual(result, {
      tables: [{ category: undefined, rows: buildTournamentRows([source]), showSgfs: true }],
    });
    const serialized = JSON.parse(JSON.stringify(result));
    assert.equal(typeof serialized.tables[0].rows[0].games, 'number');
    assert.equal(typeof serialized.tables[0].rows[0].stages, 'number');
    assert.equal('participants' in serialized.tables[0].rows[0], false);
    assert.equal(buildTournamentTables({ ...event, generateSgfs: false }, [source]).tables[0].showSgfs, false);
    assert.equal(buildTournamentTables(event, [source]).tables[0].showSgfs, false);
    assert.deepEqual(buildTournamentTables(event, []), { tables: [] });
    assert.deepEqual(buildTournamentTables(event, [tournament({ announcement: true })]), { tables: [] });
  });

  it('keeps configured category order, omits empty tables and hides category SGF counts', () => {
    const source = tournament({
      participants: { a: player('a') },
      categoriesTop: { u12: [['a']], u16: [['a']] },
      hasSgfs: true,
    });
    const result = buildTournamentTables({ ...event, categories: ['u16', 'u21', 'u12'] }, [source]);
    assert.deepEqual(
      result.tables.map((table) => table.category),
      ['u16', 'u12']
    );
    for (const table of result.tables) {
      assert.deepEqual(table.rows, buildTournamentRows([source], table.category));
      assert.equal(table.showSgfs, false);
    }
  });

  it('retains pair podium members and their canonical IDs after JSON serialization', () => {
    const pair = { id: 'pair', members: [player('a'), player('b')] as [Player, Player] };
    const source = tournament({ participants: { pair }, top: [['pair']] });
    const result = JSON.parse(JSON.stringify(buildTournamentTables({ ...event, pairs: true }, [source])));
    assert.deepEqual(result.tables[0].rows[0].gold, [pair]);
  });
});
