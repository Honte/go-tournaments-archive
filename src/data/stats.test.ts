import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game, Player, Tournament, TournamentDetails } from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import { loadClassificationStage } from '@/data/classification';
import { createPlayersHandler } from '@/data/players';
import { calculateStats } from '@/data/stats';

describe('calculateStats', () => {
  it('skips excluded stages for player and country stats while keeping global games', () => {
    const playersHandler = createPlayersHandler();
    const players = playersHandler.loadJson({
      a: 'Alice Nowak 1d (PL)',
      b: 'Bob Smith 1k (DE)',
      c: 'Carol Lee 2k (FR)',
    });
    const games: Record<string, Game> = {
      g1: {
        id: 'g1',
        stage: 0,
        players: [
          { id: 'a', won: true },
          { id: 'b', won: false },
        ],
        result: 'B+R',
        props: { sgf: '2025/g1.sgf' },
      },
      g2: {
        id: 'g2',
        stage: 0,
        players: [
          { id: 'b', won: true },
          { id: 'c', won: false },
        ],
        result: 'B+T',
        props: { yt: 'stream' },
      },
    };

    const stats = calculateStats(creteEventConfig(), [createTournament(players, games)], playersHandler);
    const alice = stats.players[players.a.id];

    assert.deepEqual(
      alice.results.map((result) => result.year),
      [2025]
    );
    assert.deepEqual(
      alice.results.flatMap((result) => result.stages.map((stage) => stage.name)),
      ['Main']
    );
    assert.deepEqual(alice.country, ['PL']);
    assert.deepEqual(alice.opponents, { [players.b.id]: 'Bob Smith' });
    assert.equal(alice.totalAttended, 1);
    assert.equal(alice.bestPlace, 1);
    assert.equal(alice.totalGames, 2);
    assert.equal(alice.totalWon, 2);
    assert.equal(alice.score, 10_000);
    assert.equal(alice.totalSgfs, 1);
    assert.equal(stats.players[players.c.id], undefined);
    assert.deepEqual(Object.keys(stats.countries).sort(), ['DE', 'PL']);
    assert.equal(stats.summary.players, 2);
    assert.equal(stats.summary.playedGames, 2);
    assert.equal(stats.summary.sgfs, 1);
    assert.equal(stats.summary.streams, 1);
    assert.deepEqual(Object.keys(stats.games).sort(), ['g1', 'g2']);
  });
});

describe('loadClassificationStage', () => {
  it('does not derive tournament medals from excluded classification stages', () => {
    const playersHandler = createPlayersHandler();
    const playersMap: Record<string, Player> = {};
    const tournamentDetails = createTournamentDetails();

    loadClassificationStage({
      stage: {
        type: 'classification',
        date: '2025-01-01',
        excluded: true,
        order: ['Alice Nowak 1d (PL)', 'Bob Smith 1k (DE)', 'Carol Lee 2k (FR)'],
      },
      playersMap,
      playersHandler,
      tournamentDetails,
    });

    assert.deepEqual(tournamentDetails.top, []);
  });

  it('keeps explicit tournament medals when classification stages are excluded', () => {
    const playersHandler = createPlayersHandler();
    const playersMap: Record<string, Player> = {};
    const tournamentDetails = createTournamentDetails([['explicit-winner']]);

    loadClassificationStage({
      stage: {
        type: 'classification',
        date: '2025-01-01',
        excluded: true,
        order: ['Alice Nowak 1d (PL)', 'Bob Smith 1k (DE)', 'Carol Lee 2k (FR)'],
      },
      playersMap,
      playersHandler,
      tournamentDetails,
    });

    assert.deepEqual(tournamentDetails.top, [['explicit-winner']]);
  });
});

function creteEventConfig(): EventDefinition {
  return {
    id: 'test',
    locales: ['en'],
  };
}

function createTournament(players: Record<string, Player>, games: Record<string, Game>): Tournament {
  return {
    id: 2025,
    year: 2025,
    location: 'Warsaw',
    top: [['a'], ['b']],
    games,
    players,
    hasSgfs: true,
    stages: [
      {
        type: 'league',
        name: 'Main',
        rounds: [['g1']],
        table: [
          {
            id: 'a',
            place: 1,
            index: 1,
            games: [
              {
                game: 'g1',
                opponent: 'b',
                won: true,
                result: 'B+R',
                index: 2,
              },
              {
                game: 'bye',
                opponent: 'BYE',
                won: true,
                result: 'BYE',
                index: 0,
              },
            ],
            won: ['b'],
            lost: [],
            breakers: createBreakers(1),
          },
          {
            id: 'b',
            place: 2,
            index: 2,
            games: [
              {
                game: 'g1',
                opponent: 'a',
                won: false,
                result: 'B+R',
                index: 1,
              },
            ],
            won: [],
            lost: ['a'],
            breakers: createBreakers(0),
          },
        ],
      },
      {
        type: 'league',
        name: 'Side',
        excluded: true,
        rounds: [['g2']],
        table: [
          {
            id: 'b',
            place: 1,
            index: 1,
            games: [
              {
                game: 'g2',
                opponent: 'c',
                won: true,
                result: 'B+T',
                index: 2,
              },
            ],
            won: ['c'],
            lost: [],
            breakers: createBreakers(1),
          },
          {
            id: 'c',
            place: 2,
            index: 2,
            games: [
              {
                game: 'g2',
                opponent: 'b',
                won: false,
                result: 'B+T',
                index: 1,
              },
            ],
            won: [],
            lost: ['b'],
            breakers: createBreakers(0),
          },
        ],
      },
    ],
  };
}

function createTournamentDetails(top: string[][] = []): TournamentDetails {
  return {
    year: 2025,
    location: 'Warsaw',
    top,
  };
}

function createBreakers(wins: number) {
  return {
    wins,
    sos: 0,
    sodos: 0,
    sosos: 0,
    starting: 0,
    rank: 0,
    score: 0,
    mms: 0,
  };
}
