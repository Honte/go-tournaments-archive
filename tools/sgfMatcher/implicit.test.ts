import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeH9Player } from '@tools/sgfMatcher/mocks';
import { buildPlayersMap, matchImplicitSgfs } from './implicit';
import type { H9GameRecord, ParsedGameEntry, SgfInfo } from './types';
import { normalizePlayerName } from './utils';

describe('matchImplicitSgfs', () => {
  it('matches SGF names written in H9 surname-name order', () => {
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Hironori', surname: 'Hirata' }),
      makeH9Player({ place: 4, name: 'Sung-kyun', surname: 'Park' }),
    ]);
    const gamesMap = new Map([
      [
        '1-4-8',
        makeH9Record({
          homePlace: 4,
          awayPlace: 1,
          round: 8,
          winnerPlace: 1,
          homeColor: 'black',
          winnerColor: 'white',
        }),
      ],
    ]);
    const sgf = makeSgfInfo({
      path: '1995/8-SungkyunPark-HirataHironori.sgf',
      sgfBlackName: 'Sung kyun Park',
      sgfWhiteName: 'Hirata Hironori',
      filenameBlackName: 'SungkyunPark',
      filenameWhiteName: 'HirataHironori',
      filenameRound: 8,
      rawResult: 'W+0.5',
      cleanResult: 'W+0.5',
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.deepEqual(result, {
      matchedEntries: ['4-1 1:W+0.5 round:8 sgf:1995/8-SungkyunPark-HirataHironori.sgf'],
      matchedSgfs: ['1995/8-SungkyunPark-HirataHironori.sgf'],
      unmatchedSgfs: [],
      unmatchedEntries: [],
    });
  });

  it('treats SGF filenames with spaces as unmatched', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({
      path: '2025/1-BlackPlayer-WhitePlayer copy.sgf',
      sgfBlackName: 'Black Player',
      sgfWhiteName: 'White Player',
      filenameBlackName: 'BlackPlayer',
      filenameWhiteName: 'WhitePlayer copy',
      rawResult: 'B+R',
      cleanResult: 'B+R',
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.equal(result.matchedEntries.length, 0);
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
        makeH9Record({
          homePlace: 1,
          awayPlace: 2,
          round: 1,
          winnerPlace: 1,
          homeColor: undefined,
          winnerColor: undefined,
        }),
      ],
    ]);
    const sgf = makeSgfInfo({
      path: '2025/1-LoserPlayer-WinnerPlayer.sgf',
      sgfBlackName: 'Loser Player',
      sgfWhiteName: 'Winner Player',
      filenameBlackName: 'LoserPlayer',
      filenameWhiteName: 'WinnerPlayer',
      rawResult: null,
      cleanResult: null,
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['2-1 1:W+? round:1 sgf:2025/1-LoserPlayer-WinnerPlayer.sgf']);
  });

  it('uses the SGF winner color when H9 gives the winner but SGF result is a question mark', () => {
    const { playersMap, gamesMap } = makeWinnerContext();
    const sgf = makeSgfInfo({
      path: '2025/1-WinnerPlayer-LoserPlayer.sgf',
      sgfBlackName: 'Winner Player',
      sgfWhiteName: 'Loser Player',
      filenameBlackName: 'WinnerPlayer',
      filenameWhiteName: 'LoserPlayer',
      rawResult: '?',
      cleanResult: null,
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['1-2 1:B+? round:1 sgf:2025/1-WinnerPlayer-LoserPlayer.sgf']);
  });

  it('does not report metadata player names as missing when filename names resolve', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({
      path: '2025/1-BlackPlayer-WhitePlayer.sgf',
      sgfBlackName: 'Player Black 7D (AA)',
      sgfWhiteName: 'Player White 6D (BB)',
      filenameBlackName: 'BlackPlayer',
      filenameWhiteName: 'WhitePlayer',
      contentIssue: 'longest branch is not main branch',
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['longest branch is not main branch']);
  });

  it('reports new SGFs that match an existing YAML game as unmatched in non-force mode', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer-copy.sgf' });
    const existingGame = makeParsedGameEntry('2025/1-BlackPlayer-WhitePlayer.sgf');

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['matching game already has sgf']);
  });

  it('marks every new SGF for the same game unmatched', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const first = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer-a.sgf' });
    const second = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer-b.sgf' });

    const result = matchImplicitSgfs({
      sgfInfos: [first, second],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(
      result.unmatchedEntries.map((entry) => entry.reasons),
      [['matches same game as other file'], ['matches same game as other file']]
    );
  });

  it('reopens existing YAML games for duplicate matching in force mode', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const existing = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer.sgf' });
    const duplicate = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer-copy.sgf' });
    const existingGame = makeParsedGameEntry(existing.path);

    const result = matchImplicitSgfs({
      sgfInfos: [existing, duplicate],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      force: true,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(
      result.unmatchedEntries.map((entry) => entry.reasons),
      [['matches same game as other file'], ['matches same game as other file']]
    );
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

function makeSimpleContext(): { playersMap: Map<string, number>; gamesMap: Map<string, H9GameRecord> } {
  const playersMap = buildPlayersMap([
    makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
    makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
  ]);
  const gamesMap = new Map([
    [
      '1-2-1',
      makeH9Record({
        homePlace: 1,
        awayPlace: 2,
        round: 1,
        winnerPlace: 1,
        homeColor: 'black',
        winnerColor: 'black',
      }),
    ],
  ]);

  return { playersMap, gamesMap };
}

function makeWinnerContext(): { playersMap: Map<string, number>; gamesMap: Map<string, H9GameRecord> } {
  const playersMap = buildPlayersMap([
    makeH9Player({ place: 1, name: 'Winner', surname: 'Player' }),
    makeH9Player({ place: 2, name: 'Loser', surname: 'Player' }),
  ]);
  const gamesMap = new Map([
    [
      '1-2-1',
      makeH9Record({
        homePlace: 1,
        awayPlace: 2,
        round: 1,
        winnerPlace: 1,
        homeColor: undefined,
        winnerColor: undefined,
      }),
    ],
  ]);

  return { playersMap, gamesMap };
}

function makeH9Record(record: H9GameRecord): H9GameRecord {
  return record;
}

function makeParsedGameEntry(sgf: string): ParsedGameEntry {
  return {
    id: '1-2-1',
    sgf,
    round: 1,
    props: '',
  };
}

function makeSgfInfo(overrides: Partial<SgfInfo> = {}): SgfInfo {
  return {
    path: '2025/1-BlackPlayer-WhitePlayer.sgf',
    sgfBlackName: 'Black Player',
    sgfWhiteName: 'White Player',
    sgfRound: null,
    filenameBlackName: 'BlackPlayer',
    filenameWhiteName: 'WhitePlayer',
    filenameRound: 1,
    filenameStage: null,
    rawResult: 'B+R',
    cleanResult: 'B+R',
    resultIssue: null,
    contentIssue: null,
    corrupted: false,
    ...overrides,
  };
}
