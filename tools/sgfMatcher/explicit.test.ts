import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { InputTournament } from '@/schema/input';
import { makeSgfInfo } from '@tools/sgfMatcher/mocks';
import { matchExplicitSgfs } from './explicit';

describe('matchExplicitSgfs', () => {
  it('matches a jigo SGF to an explicit jigo game', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameRound: 1,
      filenameStage: 'league',
      rawResult: 'Jigo',
      cleanResult: '0',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp jigo']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['bp-wp jigo black:bp sgf:2025-league-1-bp-wp.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('uses SGF metadata to set black for a jigo without changing the YAML player order', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      sgfBlackName: 'Black Player',
      sgfWhiteName: 'White Player',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameRound: 1,
      filenameStage: 'league',
      rawResult: 'Jigo',
      cleanResult: '0',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['wp-bp jigo']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['wp-bp jigo black:bp sgf:2025-league-1-bp-wp.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('uses SGF winner color and result when matching explicit games', () => {
    const tournament: InputTournament = {
      players: {
        kc: 'Test Player Alpha 4d',
        ak: 'Test Player Beta 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-kc-ak.sgf',
      sgfBlackName: 'Test Player Beta',
      sgfWhiteName: 'Test Player Alpha',
      filenameBlackName: 'kc',
      filenameWhiteName: 'ak',
      filenameRound: 1,
      filenameStage: 'league',
      rawResult: 'W+20.5',
      cleanResult: 'W+20.5',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['kc-ak kc:B+20.5']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['kc-ak kc:W+20.5 sgf:2025-league-1-kc-ak.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('matches explicit SGF names using players.yml nicknames', () => {
    const tournament: InputTournament = {
      players: {
        sf: 'Test Fixture 2p |10000001',
        wp: 'White Player 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-fixture-nick-wp.sgf',
      sgfBlackName: 'fixture-nick',
      sgfWhiteName: 'White Player',
      filenameBlackName: 'fixture-nick',
      filenameWhiteName: 'wp',
      filenameRound: 1,
      filenameStage: 'league',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['sf-wp sf:B+R']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
      eventPlayers: [
        {
          id: 'test-fixture',
          name: 'Test Fixture',
          egd: 10000001,
          original: 'Test Fixture',
          nickname: ['fixture-nick'],
          pastNames: [],
        },
      ],
    });

    assert.deepEqual(result.matchedEntries, ['sf-wp sf:B+R sgf:2025-league-1-fixture-nick-wp.sgf']);
  });

  it('matches comma-form SGF player names with a misspelled given name', () => {
    const tournament: InputTournament = {
      players: {
        sp: 'Test Alpha 3d',
        kh: 'Test Beta 4d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2014/2014-1-testalpha-testbeta.sgf',
      sgfBlackName: 'Beta, Test',
      sgfWhiteName: 'Alpha, Tset',
      filenameBlackName: 'testalpha',
      filenameWhiteName: 'testbeta',
      filenameRound: 1,
      rawResult: 'W+1.5',
      cleanResult: 'W+1.5',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2014-12-11',
        rounds: [['kh-sp sp:W+1.5']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['kh-sp sp:W+1.5 sgf:2014/2014-1-testalpha-testbeta.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('does not change the YAML winner when SGF result points to the other player', () => {
    const tournament: InputTournament = {
      players: {
        kc: 'Test Player Alpha 4d',
        ak: 'Test Player Beta 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-kc-ak.sgf',
      sgfBlackName: 'Test Player Beta',
      sgfWhiteName: 'Test Player Alpha',
      filenameBlackName: 'kc',
      filenameWhiteName: 'ak',
      filenameRound: 1,
      filenameStage: 'league',
      rawResult: 'B+20.5',
      cleanResult: 'B+20.5',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['kc-ak kc']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['result conflict']);
  });

  it('does not use filename order to assign winner color when SGF player metadata is missing', () => {
    const tournament: InputTournament = {
      players: {
        kc: 'Test Player Alpha 4d',
        ak: 'Test Player Beta 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-ak-kc.sgf',
      sgfBlackName: null,
      sgfWhiteName: null,
      filenameBlackName: 'ak',
      filenameWhiteName: 'kc',
      filenameRound: 1,
      filenameStage: 'league',
      rawResult: 'B+R',
      cleanResult: 'B+R',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['kc-ak kc']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['kc-ak kc:B+R sgf:2025-league-1-ak-kc.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('treats conflicting SGF metadata and filename players as unmatched', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
        op: 'Other Player 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      sgfBlackName: 'Black Player',
      sgfWhiteName: 'Other Player',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameRound: 1,
      filenameStage: 'league',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.equal(result.unmatchedEntries[0]?.filename, '2025-league-1-bp-wp.sgf');
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['metadata player names conflict with filename']);
  });

  it('reports new SGFs that match an existing YAML game as unmatched in non-force mode', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp-copy.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf']],
      },
      sgfPaths: ['2025-league-1-bp-wp.sgf', sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.reusedEntries, ['bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf']);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['matching game already has sgf']);
  });

  it('adds OGS props extracted from SGF metadata to explicit game entries', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };

    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
      sgfOgs: 'https://online-go.com/review/114161',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, [
      'bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf ogs:https://online-go.com/review/114161',
    ]);
  });

  it('preserves matching existing OGS props in explicit game entries', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };

    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
      sgfOgs: 'https://online-go.com/review/114161',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [
          ['bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf yt:https://example.test ogs:https://online-go.com/review/114161'],
        ],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: true,
    });

    assert.deepEqual(result.matchedEntries, [
      'bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf yt:https://example.test ogs:https://online-go.com/review/114161',
    ]);
  });

  it('reports OGS conflicts in explicit game entries', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };

    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
      sgfOgs: 'https://online-go.com/review/114161',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf ogs:https://online-go.com/review/114162']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: true,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['ogs conflict']);
  });

  it('matches a replacement SGF and removes the stale SGF without force', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };

    const sgf = makeSgfInfo({
      path: '2025-league-1-bp-wp-new.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R sgf:2025-league-1-bp-wp-missing.sgf']],
      },
      sgfPaths: [sgf.path],
      sgfInfos: [sgf],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['bp-wp bp:B+R sgf:2025-league-1-bp-wp-new.sgf']);
    assert.deepEqual(result.removedEntries, [
      {
        previousSgf: '2025-league-1-bp-wp-missing.sgf',
        entry: 'bp-wp bp:B+R sgf:2025-league-1-bp-wp-missing.sgf',
      },
    ]);
    assert.deepEqual(result.inlineUpdates, [
      { path: ['rounds', 0, 0], value: 'bp-wp bp:B+R sgf:2025-league-1-bp-wp-new.sgf' },
    ]);
  });

  it('removes a missing existing SGF when no replacement is found', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R yt:https://example.test sgf:2025-league-1-bp-wp-missing.sgf']],
      },
      sgfPaths: [],
      sgfInfos: [],
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.removedEntries, [
      {
        previousSgf: '2025-league-1-bp-wp-missing.sgf',
        entry: 'bp-wp bp:B+R yt:https://example.test sgf:2025-league-1-bp-wp-missing.sgf',
      },
    ]);
    assert.deepEqual(result.inlineUpdates, [{ path: ['rounds', 0, 0], value: 'bp-wp bp:B+R yt:https://example.test' }]);
  });

  it('reopens existing YAML games for duplicate matching in force mode', () => {
    const tournament: InputTournament = {
      players: {
        bp: 'Black Player 1d',
        wp: 'White Player 1d',
      },
      stages: [],
    };
    const existing = makeSgfInfo({
      path: '2025-league-1-bp-wp.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
    });
    const copy = makeSgfInfo({
      path: '2025-league-1-bp-wp-copy.sgf',
      filenameBlackName: 'bp',
      filenameWhiteName: 'wp',
      filenameStage: 'league',
    });

    const result = matchExplicitSgfs({
      tournament,
      stage: {
        type: 'league',
        date: '2025-01-01',
        rounds: [['bp-wp bp:B+R sgf:2025-league-1-bp-wp.sgf']],
      },
      sgfPaths: [existing.path, copy.path],
      sgfInfos: [existing, copy],
      force: true,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.reusedEntries, []);
    assert.deepEqual(
      result.unmatchedEntries.map((entry) => entry.reasons),
      [['matches same game as other file'], ['matches same game as other file']]
    );
    assert.deepEqual(result.inlineUpdates, [{ path: ['rounds', 0, 0], value: 'bp-wp bp:B+R' }]);
  });
});

it('rejects an explicit game whose two colors resolve to one player', () => {
  const sgf = makeSgfInfo({ sgfWhiteName: 'Black Player', filenameWhiteName: 'BlackPlayer' });
  const result = matchExplicitSgfs({
    tournament: { players: { bp: 'Black Player 1d' }, stages: [] },
    stage: { type: 'league', date: '2025-01-01', rounds: [['bp-bp bp:B+R']] },
    sgfPaths: [sgf.path],
    sgfInfos: [sgf],
    force: true,
  });
  assert.deepEqual(result.matchedEntries, []);
  assert.ok(result.unmatchedEntries[0].reasons.includes('both colors resolve to the same player'));
});
