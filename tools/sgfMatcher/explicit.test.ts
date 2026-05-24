import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { InputTournament } from '@/schema/input';
import { makeSgfInfo } from '@tools/sgfMatcher/mocks';
import { matchExplicitSgfs } from './explicit';

describe('matchExplicitSgfs', () => {
  it('matches explicit games when SGF color order is reversed from the YAML result', () => {
    const tournament: InputTournament = {
      players: {
        kc: 'Kamil Chwedyna 4d',
        ak: 'Arkadiusz Kindziuk 1d',
      },
      stages: [],
    };
    const sgf = makeSgfInfo({
      path: '2025-league-1-kc-ak.sgf',
      sgfBlackName: 'Arkadiusz Kindziuk',
      sgfWhiteName: 'Kamil Chwedyna',
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

    assert.deepEqual(result.matchedEntries, ['kc-ak kc:B+20.5 sgf:2025-league-1-kc-ak.sgf']);
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

  it('updates a missing existing SGF without force', () => {
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
    assert.deepEqual(result.updatedEntries, [
      {
        previousSgf: '2025-league-1-bp-wp-missing.sgf',
        nextSgf: '2025-league-1-bp-wp-new.sgf',
        entry: 'bp-wp bp:B+R sgf:2025-league-1-bp-wp-new.sgf',
      },
    ]);
    assert.deepEqual(result.removedEntries, []);
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
    assert.deepEqual(result.updatedEntries, []);
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
