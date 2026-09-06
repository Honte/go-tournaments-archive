import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { makeH9Player, makeSgfInfo } from '@tools/sgfMatcher/mocks';
import { buildPlayersMap, matchImplicitSgfs } from './implicit';
import type { H9GameRecord, ParsedGameEntry } from './types';
import { stringifyProps } from './utils';

describe('matchImplicitSgfs', () => {
  it('matches a jigo SGF to a jigo H9 game', () => {
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
          winnerPlace: null,
          homeColor: 'black',
          winnerColor: undefined,
        }),
      ],
    ]);
    const sgf = makeSgfInfo({ rawResult: 'Draw', cleanResult: 'jigo' });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      currentSgfPaths: new Set([sgf.path]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['1-2 jigo black:1 round:1 sgf:2025/1-BlackPlayer-WhitePlayer.sgf']);
    assert.deepEqual(result.unmatchedEntries, []);
  });

  it('matches SGF names written in H9 surname-name order', () => {
    const playersMap = buildPlayersMap([
      makeH9Player({ place: 1, name: 'Test-One', surname: 'Example' }),
      makeH9Player({ place: 4, name: 'Sample', surname: 'Player' }),
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
      path: '1995/8-SamplePlayer-ExampleTestOne.sgf',
      sgfBlackName: 'Sample Player',
      sgfWhiteName: 'Example Test One',
      filenameBlackName: 'SamplePlayer',
      filenameWhiteName: 'ExampleTestOne',
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
      currentSgfPaths: new Set([sgf.path]),
      force: false,
    });

    assert.deepEqual(result, {
      matchedEntries: ['4-1 1:W+0.5 round:8 sgf:1995/8-SamplePlayer-ExampleTestOne.sgf'],
      removedEntries: [],
      matchedSgfs: ['1995/8-SamplePlayer-ExampleTestOne.sgf'],
      unmatchedSgfs: [],
      unmatchedEntries: [],
    });
  });

  it('matches SGF names using players.yml nicknames', () => {
    const playersMap = buildPlayersMap(
      [
        makeH9Player({ place: 1, name: 'Test', surname: 'Fixture' }),
        makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
      ],
      [
        {
          id: 'test-fixture',
          name: 'Test Fixture',
          egd: 10000001,
          original: 'Test Fixture',
          nickname: ['fixture-nick'],
          pastNames: [],
        },
      ]
    );
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
    const sgf = makeSgfInfo({
      path: '2025/1-fixture-nick-WhitePlayer.sgf',
      sgfBlackName: 'fixture-nick',
      sgfWhiteName: 'White Player',
      filenameBlackName: 'fixture-nick',
      filenameWhiteName: 'WhitePlayer',
      filenameRound: 1,
      rawResult: 'B+R',
      cleanResult: 'B+R',
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      currentSgfPaths: new Set([sgf.path]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['1-2 1:B+R round:1 sgf:2025/1-fixture-nick-WhitePlayer.sgf']);
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
      currentSgfPaths: new Set([sgf.path]),
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
      currentSgfPaths: new Set([sgf.path]),
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
      currentSgfPaths: new Set([sgf.path]),
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
      currentSgfPaths: new Set([sgf.path]),
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
      currentSgfPaths: new Set([existingGame.sgf, sgf.path]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['matching game already has sgf']);
  });

  it('adds OGS props extracted from SGF metadata to implicit game entries', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({ sgfOgs: 'https://online-go.com/review/114161' });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map(),
      existingGamesBySgf: new Map(),
      currentSgfPaths: new Set([sgf.path]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, [
      '1-2 1:B+R round:1 sgf:2025/1-BlackPlayer-WhitePlayer.sgf ogs:https://online-go.com/review/114161',
    ]);
  });

  it('preserves matching existing OGS props in implicit game entries', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({ sgfOgs: 'https://online-go.com/review/114161' });
    const existingGame = makeParsedGameEntry(sgf.path, {
      yt: 'https://example.test',
      ogs: 'https://online-go.com/review/114161',
    });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      currentSgfPaths: new Set([sgf.path]),
      force: true,
    });

    assert.deepEqual(result.matchedEntries, [
      '1-2 1:B+R round:1 sgf:2025/1-BlackPlayer-WhitePlayer.sgf yt:https://example.test ogs:https://online-go.com/review/114161',
    ]);
  });

  it('reports OGS conflicts in implicit game entries', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const sgf = makeSgfInfo({ sgfOgs: 'https://online-go.com/review/114161' });
    const existingGame = makeParsedGameEntry(sgf.path, { ogs: 'https://online-go.com/review/114162' });

    const result = matchImplicitSgfs({
      sgfInfos: [sgf],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      currentSgfPaths: new Set([sgf.path]),
      force: true,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.unmatchedEntries[0]?.reasons, ['ogs conflict']);
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
      currentSgfPaths: new Set([first.path, second.path]),
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
      currentSgfPaths: new Set([existing.path, duplicate.path]),
      force: true,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(
      result.unmatchedEntries.map((entry) => entry.reasons),
      [['matches same game as other file'], ['matches same game as other file']]
    );
  });

  it('matches a replacement SGF and removes the stale SGF without force', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const replacement = makeSgfInfo({ path: '2025/1-BlackPlayer-WhitePlayer-new.sgf' });
    const existingGame = makeParsedGameEntry('2025/1-BlackPlayer-WhitePlayer-missing.sgf');

    const result = matchImplicitSgfs({
      sgfInfos: [replacement],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      currentSgfPaths: new Set([replacement.path]),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, ['1-2 1:B+R round:1 sgf:2025/1-BlackPlayer-WhitePlayer-new.sgf']);
    assert.deepEqual(result.removedEntries, [
      {
        previousSgf: '2025/1-BlackPlayer-WhitePlayer-missing.sgf',
        entry: '1-2 1:B+R round:1 sgf:2025/1-BlackPlayer-WhitePlayer-missing.sgf',
      },
    ]);
  });

  it('removes a missing existing SGF when no replacement is found', () => {
    const { playersMap, gamesMap } = makeSimpleContext();
    const existingGame = makeParsedGameEntry('2025/1-BlackPlayer-WhitePlayer-missing.sgf');

    const result = matchImplicitSgfs({
      sgfInfos: [],
      playersMap,
      gamesMap,
      existingGamesById: new Map([['1-2-1', existingGame]]),
      existingGamesBySgf: new Map([[existingGame.sgf, existingGame]]),
      currentSgfPaths: new Set(),
      force: false,
    });

    assert.deepEqual(result.matchedEntries, []);
    assert.deepEqual(result.removedEntries, [
      {
        previousSgf: '2025/1-BlackPlayer-WhitePlayer-missing.sgf',
        entry: '1-2 1:B+R round:1 sgf:2025/1-BlackPlayer-WhitePlayer-missing.sgf',
      },
    ]);
  });
});

function makeSimpleContext(): { playersMap: Map<string, number | null>; gamesMap: Map<string, H9GameRecord> } {
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

function makeWinnerContext(): { playersMap: Map<string, number | null>; gamesMap: Map<string, H9GameRecord> } {
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

function makeParsedGameEntry(sgf: string, props: Record<string, string> = {}): ParsedGameEntry {
  return {
    id: '1-2-1',
    sgf,
    props,
    raw: `1-2 1:B+R round:1 sgf:${sgf}${stringifyProps(props)}`,
  };
}

describe('player identity safety', () => {
  for (const usePastName of [false, true]) {
    it(
      usePastName ? 'matches a past name with reversed filename participants' : 'rejects a mixed-source self match',
      () => {
        const { gamesMap } = makeSimpleContext();
        const playersMap = buildPlayersMap(
          [
            makeH9Player({ place: 1, name: 'Black', surname: 'Player' }),
            makeH9Player({ place: 2, name: 'White', surname: 'Player' }),
          ],
          usePastName
            ? [
                {
                  id: 'white',
                  name: 'White Player',
                  nickname: [],
                  pastNames: ['Former Identity'],
                },
              ]
            : []
        );
        const sgf = makeSgfInfo({
          sgfBlackName: 'Black Player',
          sgfWhiteName: 'Former Identity',
          filenameBlackName: 'WhitePlayer',
          filenameWhiteName: 'BlackPlayer',
        });
        const result = matchImplicitSgfs({
          sgfInfos: [sgf],
          playersMap,
          gamesMap,
          existingGamesById: new Map(),
          existingGamesBySgf: new Map(),
          currentSgfPaths: new Set([sgf.path]),
          force: true,
        });
        if (usePastName) {
          assert.equal(result.matchedEntries.length, 1);
          assert.match(result.matchedEntries[0], /^1-2 /);
          assert.deepEqual(result.unmatchedEntries, []);
        } else {
          assert.deepEqual(result.matchedEntries, []);
          assert.deepEqual(result.unmatchedEntries[0].reasons, ['both colors resolve to the same player']);
        }
      }
    );
  }
});
