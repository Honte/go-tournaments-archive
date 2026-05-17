import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDocument } from 'yaml';
import type { H9Player } from '@/libs/h9';
import { matchSgfs } from './match';
import { buildUnmatchedEntries } from './report';
import { normalizeSgfResult } from './sgf';
import { buildPlayersMap } from './tournament';
import type { SgfInfo } from './types';
import { normalizePlayerName } from './utils';
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
    assert.deepEqual(normalizeSgfResult('blAcK+R'), { cleanResult: 'B+R', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('wHiTe+4.5'), { cleanResult: 'W+4.5', resultIssue: null });
  });

  it('accepts bare color results', () => {
    assert.deepEqual(normalizeSgfResult('B'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('b'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('W'), { cleanResult: 'W+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('w'), { cleanResult: 'W+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('Black'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('blAcK'), { cleanResult: 'B+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('White'), { cleanResult: 'W+?', resultIssue: null });
    assert.deepEqual(normalizeSgfResult('white'), { cleanResult: 'W+?', resultIssue: null });
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

  it('matches SGF names written in H9 surname-name order', () => {
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Hironori', surname: 'Hirata' }),
      makeH9Player({ place: 4, name: 'Sung-kyun', surname: 'Park' }),
    ]);
    const gamesMap = new Map([
      [
        '1-4-8',
        {
          homePlace: 4,
          awayPlace: 1,
          round: 8,
          winnerPlace: 1,
          homeColor: 'black' as const,
          winnerColor: 'white' as const,
        },
      ],
    ]);
    const sgf: SgfInfo = {
      path: '1995/8-SungkyunPark-HirataHironori.sgf',
      metadata: { blackName: 'Sung kyun Park', whiteName: 'Hirata Hironori' },
      fromFilename: { blackName: 'SungkyunPark', whiteName: 'HirataHironori' },
      rawResult: 'W+0.5',
      cleanResult: 'W+0.5',
      resultIssue: null,
      round: 8,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map());

    assert.deepEqual(result, {
      matchedEntries: ['4-1 1:W+0.5 round:8 sgf:1995/8-SungkyunPark-HirataHironori.sgf'],
      unmatchedSgfs: [],
    });
  });

  it('treats SGF filenames with spaces as unmatched', () => {
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
    const sgf: SgfInfo = {
      path: '2025/1-BlackPlayer-WhitePlayer copy.sgf',
      metadata: { blackName: 'Black Player', whiteName: 'White Player' },
      fromFilename: { blackName: 'BlackPlayer', whiteName: 'WhitePlayer copy' },
      rawResult: 'B+R',
      cleanResult: 'B+R',
      resultIssue: null,
      round: 1,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map());
    const unmatchedEntries = buildUnmatchedEntries(result.unmatchedSgfs, playersMap, new Map());

    assert.deepEqual(result, { matchedEntries: [], unmatchedSgfs: [sgf] });
    assert.deepEqual(unmatchedEntries[0]?.reasons, ['filename contains spaces']);
  });

  it('uses the SGF winner color when H9 gives the winner but SGF result is missing', () => {
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Winner', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'Loser', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: undefined,
          winnerColor: undefined,
        },
      ],
    ]);
    const sgf: SgfInfo = {
      path: '2025/1-LoserPlayer-WinnerPlayer.sgf',
      metadata: { blackName: 'Loser Player', whiteName: 'Winner Player' },
      fromFilename: { blackName: 'LoserPlayer', whiteName: 'WinnerPlayer' },
      rawResult: null,
      cleanResult: null,
      resultIssue: null,
      round: 1,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map());

    assert.deepEqual(result, {
      matchedEntries: ['2-1 1:W+? round:1 sgf:2025/1-LoserPlayer-WinnerPlayer.sgf'],
      unmatchedSgfs: [],
    });
  });

  it('uses the SGF winner color when H9 gives the winner but SGF result is a question mark', () => {
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Winner', surname: 'Player' }),
      makeH9Player({ place: 2, name: 'Loser', surname: 'Player' }),
    ]);
    const gamesMap = new Map([
      [
        '1-2-1',
        {
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: undefined,
          winnerColor: undefined,
        },
      ],
    ]);
    const sgf: SgfInfo = {
      path: '2025/1-WinnerPlayer-LoserPlayer.sgf',
      metadata: { blackName: 'Winner Player', whiteName: 'Loser Player' },
      fromFilename: { blackName: 'WinnerPlayer', whiteName: 'LoserPlayer' },
      rawResult: '?',
      cleanResult: null,
      resultIssue: null,
      round: 1,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map());

    assert.deepEqual(result, {
      matchedEntries: ['1-2 1:B+? round:1 sgf:2025/1-WinnerPlayer-LoserPlayer.sgf'],
      unmatchedSgfs: [],
    });
  });
});

describe('buildPlayersMap', () => {
  it('does not overwrite primary names with reversed aliases', (t) => {
    const warn = t.mock.method(console, 'warn', () => undefined);
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Alpha', surname: 'Beta' }),
      makeH9Player({ place: 2, name: 'Beta', surname: 'Alpha' }),
    ]);

    assert.equal(playersMap.get(normalizePlayerName('Alpha Beta')), 1);
    assert.equal(playersMap.get(normalizePlayerName('Beta Alpha')), 2);

    const warnings = warn.mock.calls.map((call) => String(call.arguments[0]));
    assert.equal(warnings.length, 2);
    assert.ok(warnings.every((warning) => warning.includes('skipped normalized name alias')));
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
