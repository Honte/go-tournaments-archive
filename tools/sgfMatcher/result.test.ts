import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDocument } from 'yaml';
import { matchSgfs } from './match';
import { normalizeSgfResult } from './sgf';
import type { SgfInfo } from './types';
import { updateYamlDoc } from './yaml';

describe('normalizeSgfResult', () => {
  it('accepts compact SGF result values', () => {
    assert.deepEqual(normalizeSgfResult('B+R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+4.5'), { cleanResult: 'W+4.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('B+T'), { cleanResult: 'B+T', resultIssue: null });
  });

  it('normalizes resign results to R', () => {
    assert.deepEqual(normalizeSgfResult('B+Resign'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+resign'), { cleanResult: 'W+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White,rEsIgN'), { cleanResult: 'W+R', resultIssue: null });
  });

  it('normalizes numeric score results', () => {
    assert.deepEqual(normalizeSgfResult('W+15,5'), { cleanResult: 'W+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+15.50'), { cleanResult: 'W+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('B,15,5'), { cleanResult: 'B+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('B+15'), { cleanResult: 'B+15', resultIssue: null });
  });

  it('standardizes comma separators to plus separators', () => {
    assert.deepEqual(normalizeSgfResult('B,R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W,4.5'), { cleanResult: 'W+4.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White,T'), { cleanResult: 'W+T', resultIssue: null });
  });

  it('normalizes long color names', () => {
    assert.deepEqual(normalizeSgfResult('Black+R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White+4.5'), { cleanResult: 'W+4.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('black+R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('blAcK+R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('wHiTe+4.5'), { cleanResult: 'W+4.5', resultIssue: null });
  });

  it('accepts bare color results', () => {
    assert.deepEqual(normalizeSgfResult('B'), { cleanResult: 'B', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('b'), { cleanResult: 'B', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W'), { cleanResult: 'W', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('w'), { cleanResult: 'W', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('Black'), { cleanResult: 'B', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('blAcK'), { cleanResult: 'B', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White'), { cleanResult: 'W', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('white'), { cleanResult: 'W', resultIssue: null });
  });

  it('trims surrounding whitespace', () => {
    assert.deepEqual(normalizeSgfResult('W+R '), { cleanResult: 'W+R', resultIssue: null });
  });

  it('rejects natural-language and spaced result values', () => {
    assert.deepEqual(normalizeSgfResult('White won by resign'), {
      cleanResult: null,
      resultIssue: 'invalid result "White won by resign": expected + or , separator',
    });
    assert.deepEqual(normalizeSgfResult('White won by 4.5'), {
      cleanResult: null,
      resultIssue: 'invalid result "White won by 4.5": expected + or , separator',
    });
    assert.deepEqual(normalizeSgfResult('B+4.5 moku'), {
      cleanResult: null,
      resultIssue: 'invalid result "B+4.5 moku": result must not contain spaces',
    });
  });

  it('rejects invalid colors and result shapes', () => {
    assert.deepEqual(normalizeSgfResult('Red+R'), {
      cleanResult: null,
      resultIssue: 'invalid result color "Red": expected B, W, Black, or White',
    });
    assert.deepEqual(normalizeSgfResult('B+'), {
      cleanResult: null,
      resultIssue: 'invalid result "B+": expected B+<result> or W+<result>',
    });
    assert.deepEqual(normalizeSgfResult('B +R'), {
      cleanResult: null,
      resultIssue: 'invalid result "B +R": expected + or , separator',
    });
  });
});

describe('SGF matcher result handling', () => {
  it('treats invalid SGF results as unmatched', () => {
    const sgf: SgfInfo = {
      path: '2025/game.sgf',
      metadata: { blackName: 'Black', whiteName: 'White' },
      fromFilename: { blackName: 'Black', whiteName: 'White' },
      rawResult: 'B+4.5 moku',
      cleanResult: null,
      resultIssue: 'invalid result "B+4.5 moku": result must not contain spaces',
      round: 1,
      corrupted: false,
    };

    const result = matchSgfs([sgf], new Map(), new Map(), new Map());

    assert.deepEqual(result, { matchedEntries: [], unmatchedSgfs: [sgf] });
  });
});

describe('updateYamlDoc', () => {
  it('reports unchanged content when generated matcher data is the same', () => {
    const doc = parseDocument(`stages:
  - type: tournament
    games:
      - 1-2 1:B+R round:1 sgf:2025/game.sgf
    unmatchedSgfs:
      - 1-? ? round:1 sgf:2025/missing.sgf # no matching game
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: ['1-2 1:B+R round:1 sgf:2025/game.sgf'],
      matchedEntries: [],
      unmatchedEntries: [
        {
          filename: '2025/missing.sgf',
          line: '1-? ? round:1 sgf:2025/missing.sgf',
          reasons: ['no matching game'],
        },
      ],
      totalSgfs: 2,
    });

    assert.equal(changed, false);
  });

  it('reports changed content when generated matcher data differs', () => {
    const doc = parseDocument(`stages:
  - type: tournament
    games:
      - 1-2 1:B+R round:1 sgf:2025/game.sgf
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: ['1-2 1:B+R round:1 sgf:2025/game.sgf'],
      matchedEntries: ['3-4 3:W+R round:1 sgf:2025/other.sgf'],
      unmatchedEntries: [],
      totalSgfs: 2,
    });

    assert.equal(changed, true);
  });
});
