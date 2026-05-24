import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeH9Player } from '@tools/sgfMatcher/mocks';
import { matchSgfs } from './match';
import { buildUnmatchedEntries } from './report';
import { extractSgfInfo } from './sgf';
import { buildPlayersMap } from './tournament';

describe('extractSgfInfo', () => {
  it('treats SGFs with multiple longest branches as unmatched', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf'
    );
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: 'black' as const,
          winnerColor: 'black' as const,
        },
      ],
    ]);

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.equal(sgf.corrupted, false);
    assert.equal(sgf.contentIssue, 'multiple longest branches');
    assert.equal(result.matchedEntries.length, 0);
    assert.equal(result.matchedSgfs.length, 0);
    assert.equal(result.unmatchedSgfs.length, 1);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['multiple longest branches']);
  });

  it('allows longer side branches when strict mode is disabled', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc];B[dd]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf'
    );
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: 'black' as const,
          winnerColor: 'black' as const,
        },
      ],
    ]);

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.equal(sgf.contentIssue, null);
    assert.equal(result.matchedEntries.length, 1);
    assert.deepEqual(result.unmatchedSgfs, []);
  });

  it('treats longer side branches as unmatched in strict mode', () => {
    const sgf = extractSgfInfo(
      '(;PB[Black Player]PW[White Player]RE[B+R];B[aa](;W[bb])(;W[cc];B[dd]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf',
      true
    );
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: 'black' as const,
          winnerColor: 'black' as const,
        },
      ],
    ]);

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());
    const unmatchedEntries = buildUnmatchedEntries(result.unmatchedSgfs, playersMap, new Map());

    assert.equal(sgf.contentIssue, 'longest branch is not main branch');
    assert.equal(result.matchedEntries.length, 0);
    assert.equal(result.matchedSgfs.length, 0);
    assert.equal(result.unmatchedSgfs.length, 1);
    assert.deepEqual(unmatchedEntries[0]?.reasons, ['longest branch is not main branch']);
  });

  it('does not report metadata player names as missing when filename names resolve', () => {
    const sgf = extractSgfInfo(
      '(;PB[Player Black 7D (AA)]PW[Player White 6D (BB)]RE[B+R];B[aa](;W[bb])(;W[cc];B[dd]))',
      '2025/1-BlackPlayer-WhitePlayer.sgf',
      true
    );
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: 'black' as const,
          winnerColor: 'black' as const,
        },
      ],
    ]);

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['longest branch is not main branch']);
  });
});
