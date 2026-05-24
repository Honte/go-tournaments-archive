import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeSgfResult } from './result';

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

  it('normalizes time results to T', () => {
    assert.deepEqual(normalizeSgfResult('B+Time'), { cleanResult: 'B+T', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+time'), { cleanResult: 'W+T', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('Black,tImE'), { cleanResult: 'B+T', resultIssue: null });
  });

  it('normalizes numeric score results', () => {
    assert.deepEqual(normalizeSgfResult('W+15,5'), { cleanResult: 'W+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+15.50'), { cleanResult: 'W+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('B,15,5'), { cleanResult: 'B+15.5', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('B+15'), { cleanResult: 'B+15', resultIssue: null });
  });

  it('normalizes zero score results to unknown margin', () => {
    assert.deepEqual(normalizeSgfResult('B+0'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W+0'), { cleanResult: 'W+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('Black+0.0'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White+0,0'), { cleanResult: 'W+?', resultIssue: null });
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
    assert.deepEqual(normalizeSgfResult('wHiTe+4.5'), { cleanResult: 'W+4.5', resultIssue: null });
  });

  it('accepts bare color results', () => {
    assert.deepEqual(normalizeSgfResult('B'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('b'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W'), { cleanResult: 'W+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White'), { cleanResult: 'W+?', resultIssue: null });
  });

  it('trims surrounding whitespace', () => {
    assert.deepEqual(normalizeSgfResult('W+R '), { cleanResult: 'W+R', resultIssue: null });
  });

  it('treats question mark and void results as unknown', () => {
    assert.deepEqual(normalizeSgfResult('?'), { cleanResult: null, resultIssue: null });
    assert.deepEqual(normalizeSgfResult('void'), { cleanResult: null, resultIssue: null });
    assert.deepEqual(normalizeSgfResult('Void'), { cleanResult: null, resultIssue: null });
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
