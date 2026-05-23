import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { H9Player } from '@/libs/h9';
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

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map());
    const unmatchedEntries = buildUnmatchedEntries(result.unmatchedSgfs, playersMap, new Map());

    assert.equal(sgf.corrupted, false);
    assert.equal(sgf.contentIssue, 'multiple longest branches');
    assert.deepEqual(result, { matchedEntries: [], unmatchedSgfs: [sgf] });
    assert.deepEqual(unmatchedEntries[0]?.reasons, ['multiple longest branches']);
  });
});

function makeH9Player({ place, name, surname }: { place: number; name: string; surname: string }): H9Player {
  return {
    place,
    name,
    surname,
    rank: '1d',
    country: 'XX',
    club: 'xxx',
    games: [],
    scores: [],
  };
}
