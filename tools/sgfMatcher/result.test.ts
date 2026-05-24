import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDocument } from 'yaml';
import { makeH9Player } from '@tools/sgfMatcher/mocks';
import { matchSgfs } from './match';
import { normalizeSgfResult } from './result';
import { parseFilename } from './sgf';
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
      sgfBlackName: 'Sung kyun Park',
      sgfWhiteName: 'Hirata Hironori',
      filenameBlackName: 'SungkyunPark',
      filenameWhiteName: 'HirataHironori',
      sgfRound: null,
      filenameRound: 8,
      filenameStage: null,
      rawResult: 'W+0.5',
      cleanResult: 'W+0.5',
      resultIssue: null,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.deepEqual(result, {
      matchedEntries: ['4-1 1:W+0.5 round:8 sgf:1995/8-SungkyunPark-HirataHironori.sgf'],
      matchedSgfs: ['1995/8-SungkyunPark-HirataHironori.sgf'],
      unmatchedSgfs: [],
      unmatchedEntries: [],
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
      sgfBlackName: 'Black Player',
      sgfWhiteName: 'White Player',
      filenameBlackName: 'BlackPlayer',
      filenameWhiteName: 'WhitePlayer copy',
      sgfRound: null,
      filenameRound: 1,
      filenameStage: null,
      rawResult: 'B+R',
      cleanResult: 'B+R',
      resultIssue: null,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.equal(result.matchedEntries.length, 0);
    assert.equal(result.matchedSgfs.length, 0);
    assert.equal(result.unmatchedSgfs.length, 1);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['filename contains spaces']);
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
      sgfBlackName: 'Loser Player',
      sgfWhiteName: 'Winner Player',
      filenameBlackName: 'LoserPlayer',
      filenameWhiteName: 'WinnerPlayer',
      sgfRound: null,
      filenameRound: 1,
      filenameStage: null,
      rawResult: null,
      cleanResult: null,
      resultIssue: null,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.deepEqual(result, {
      matchedEntries: ['2-1 1:W+? round:1 sgf:2025/1-LoserPlayer-WinnerPlayer.sgf'],
      matchedSgfs: ['2025/1-LoserPlayer-WinnerPlayer.sgf'],
      unmatchedSgfs: [],
      unmatchedEntries: [],
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
      sgfBlackName: 'Winner Player',
      sgfWhiteName: 'Loser Player',
      filenameBlackName: 'WinnerPlayer',
      filenameWhiteName: 'LoserPlayer',
      sgfRound: null,
      filenameRound: 1,
      filenameStage: null,
      rawResult: '?',
      cleanResult: null,
      resultIssue: null,
      corrupted: false,
    };

    const result = matchSgfs([sgf], playersMap, gamesMap, new Map(), new Map());

    assert.deepEqual(result, {
      matchedEntries: ['1-2 1:B+? round:1 sgf:2025/1-WinnerPlayer-LoserPlayer.sgf'],
      matchedSgfs: ['2025/1-WinnerPlayer-LoserPlayer.sgf'],
      unmatchedSgfs: [],
      unmatchedEntries: [],
    });
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
      claimedSgfs: ['2025/game.sgf', '2025/missing.sgf'],
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
      claimedSgfs: ['2025/game.sgf', '2025/other.sgf'],
    });

    assert.equal(changed, true);
  });

  it('updates explicit stage games in place and writes unmatched SGFs', () => {
    const doc = parseDocument(`stages:
  - type: league
    rounds:
      - - kg-mf kg:B+R yt:https://example.test
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: [],
      matchedEntries: ['kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf'],
      unmatchedEntries: [
        {
          filename: '1997/missing.sgf',
          line: '?-? ? sgf:1997/missing.sgf',
          reasons: ['no player names found'],
        },
      ],
      totalSgfs: 2,
      claimedSgfs: ['1997/game.sgf', '1997/missing.sgf'],
      inlineUpdates: [{ path: ['rounds', 0, 0], value: 'kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf' }],
    });

    assert.equal(changed, true);
    assert.equal(
      doc.toString({ lineWidth: 0 }),
      `stages:
  - type: league
    rounds:
      - - kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf
    unmatchedSgfs:
      - ?-? ? sgf:1997/missing.sgf # no player names found
`
    );
  });
});
