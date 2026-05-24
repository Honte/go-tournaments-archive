import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractSgfInfo, hasSgfFilenameSpaces, parseFilename } from './sgf';

describe('extractSgfInfo', () => {
  it('treats SGFs with multiple longest branches as content issues', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf'
    );

    assert.equal(sgf.corrupted, false);
    assert.equal(sgf.contentIssue, 'multiple longest branches');
  });

  it('allows longer side branches when strict mode is disabled', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc];B[dd]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf'
    );

    assert.equal(sgf.contentIssue, null);
  });

  it('treats longer side branches as content issues in strict mode', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc];B[dd]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf',
      true
    );

    assert.equal(sgf.contentIssue, 'longest branch is not main branch');
  });
});

describe('parseFilename', () => {
  it('parses year-prefixed league filenames', () => {
    assert.deepEqual(parseFilename('1997/1997-league-4-kgiedrojc-lsoldan.sgf'), {
      blackName: 'kgiedrojc',
      whiteName: 'lsoldan',
      round: 4,
      stage: 'league',
    });
  });

  it('parses final filenames with index before player names', () => {
    assert.deepEqual(parseFilename('1997/1997-final-2-lsoldan-jlubos.sgf'), {
      blackName: 'lsoldan',
      whiteName: 'jlubos',
      round: 2,
      stage: 'final',
    });
  });

  it('parses final filenames with index after player names', () => {
    assert.deepEqual(parseFilename('1989/1989-lsoldan-jkraszek-final-1.sgf'), {
      blackName: 'lsoldan',
      whiteName: 'jkraszek',
      round: 1,
      stage: 'final',
    });
  });
});

describe('hasSgfFilenameSpaces', () => {
  it('detects whitespace in the SGF basename', () => {
    assert.equal(hasSgfFilenameSpaces('2025/1-BlackPlayer-WhitePlayer copy.sgf'), true);
    assert.equal(hasSgfFilenameSpaces('2025/1-BlackPlayer-WhitePlayer.sgf'), false);
  });
});
