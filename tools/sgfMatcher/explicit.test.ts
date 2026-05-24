import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { InputTournament } from '@/schema/input';
import { processExplicitStage } from './explicit';

describe('processExplicitStage', () => {
  it('matches explicit games when SGF color order is reversed from the YAML result', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'sgf-matcher-'));

    try {
      await writeFile(
        path.join(root, '2025-league-1-kc-ak.sgf'),
        '(;PB[Arkadiusz Kindziuk]PW[Kamil Chwedyna]RE[W+20.5];B[aa];W[bb])',
        'utf-8'
      );

      const tournament: InputTournament = {
        players: {
          kc: 'Kamil Chwedyna 4d',
          ak: 'Arkadiusz Kindziuk 1d',
        },
        stages: [],
      };

      const result = await processExplicitStage({
        tournament,
        stage: {
          type: 'league',
          date: '2025-01-01',
          rounds: [['kc-ak kc:B+20.5']],
        },
        sgfPaths: ['2025-league-1-kc-ak.sgf'],
        sgfDir: root,
        force: false,
        strict: false,
      });

      assert.deepEqual(result.matchedEntries, ['kc-ak kc:B+20.5 sgf:2025-league-1-kc-ak.sgf']);
      assert.deepEqual(result.unmatchedEntries, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('treats conflicting SGF metadata and filename players as unmatched', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'sgf-matcher-'));

    try {
      await writeFile(
        path.join(root, '2025-league-1-bp-wp.sgf'),
        '(;PB[Black Player]PW[Other Player]RE[B+R];B[aa];W[bb])',
        'utf-8'
      );

      const tournament: InputTournament = {
        players: {
          bp: 'Black Player 1d',
          wp: 'White Player 1d',
          op: 'Other Player 1d',
        },
        stages: [],
      };

      const result = await processExplicitStage({
        tournament,
        stage: {
          type: 'league',
          date: '2025-01-01',
          rounds: [['bp-wp bp:B+R']],
        },
        sgfPaths: ['2025-league-1-bp-wp.sgf'],
        sgfDir: root,
        force: false,
        strict: false,
      });

      assert.deepEqual(result.matchedEntries, []);
      assert.equal(result.unmatchedEntries[0]?.filename, '2025-league-1-bp-wp.sgf');
      assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['metadata player names conflict with filename']);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
