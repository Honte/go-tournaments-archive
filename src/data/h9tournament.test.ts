import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Game, Player, Tournament } from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import { filterCountryStatsByCategory } from '@/libs/countryStats';
import { getGameStats } from '@/libs/games';
import { filterPlayerStatsByCategory } from '@/libs/playerStats';
import { buildTournamentRows } from '@/libs/tournaments';
import { createPlayersHandler } from '@/data/players';
import { calculateStats } from '@/data/stats';
import { parseH9Tournament } from './h9tournament';

// Alice wins round 1. Rounds 2 and 3 are pending; round 3 also specifies colors.
const H9_RESULTS = [
  '; EV[Pending test]',
  '1 Alpha Alice 1d PL Club 1 2+ 2? 2?/w',
  '2 Beta Bob 1d DE Club 0 1- 1? 1?/b',
].join('\n');

describe('parseH9Tournament', () => {
  it('creates one game per round from reciprocal pairings', () => {
    const { stage, tournament } = parseFixture();

    assert.deepEqual(
      stage.rounds.map((round) => round.length),
      [1, 1, 1]
    );
    assert.equal(Object.keys(tournament.games).length, 3);
    assert.deepEqual(
      stage.rounds.map(([id]) => tournament.games[id].unresolved),
      [false, true, true]
    );
  });

  it('keeps pending pairings out of wins, losses, and draws', () => {
    const { stage } = parseFixture();
    const [alice, bob] = stage.table;

    assert.deepEqual(alice.won, [bob.id]);
    assert.deepEqual(bob.lost, [alice.id]);
    assert.deepEqual(alice.lost, []);
    assert.deepEqual(bob.won, []);

    for (const player of stage.table) {
      assert.deepEqual(player.drawn, []);
      assert.deepEqual(
        player.games.map((game) => ({ drawn: game?.drawn, unresolved: game?.unresolved })),
        [
          { drawn: false, unresolved: false },
          { drawn: false, unresolved: true },
          { drawn: false, unresolved: true },
        ]
      );
      assert.equal(player.games[1]?.result, '?');
      assert.equal(getGameStats(player.games.filter((game) => game !== null)).unresolved, 2);
    }
  });

  it('preserves colors on pending games without assigning a winner', () => {
    const { stage, tournament } = parseFixture();
    const [alice, bob] = stage.table;
    const pendingGame = tournament.games[stage.rounds[2][0]];

    assert.deepEqual(pendingGame.players, [
      { id: bob.id, color: 'black', won: false },
      { id: alice.id, color: 'white', won: false },
    ]);
    assert.equal(pendingGame.draw, false);
    assert.equal(tournament.games[stage.rounds[0][0]].draw, false);
  });
});

describe('statistics from H9 pairings', () => {
  it('counts completed and unresolved games separately in archive totals', () => {
    const { event, tournament, playersHandler } = parseFixture();
    const { summary } = calculateStats(event, [tournament], playersHandler);

    assert.equal(summary.playedGames, 1);
    assert.equal(summary.unresolved, 2);
    assert.equal(summary.color, 0);
    assert.equal(buildTournamentRows([tournament])[0].games, 1);
  });

  it('carries pending games into player and country statistics', () => {
    const { event, tournament, playersHandler } = parseFixture();
    const { players, countries } = calculateStats(event, [tournament], playersHandler);

    for (const player of Object.values(players)) {
      assert.equal(player.totalGames, 1);
      assert.equal(player.totalUnresolved, 2);
      assert.deepEqual(
        player.results[0].stages[0].games.map((game) => game.unresolved),
        [undefined, true, true]
      );
    }
    for (const country of Object.values(countries)) {
      assert.equal(country.totalGames, 1);
      assert.equal(country.totalUnresolved, 2);
      assert.equal(country.years[2026].totalUnresolved, 2);
    }
  });

  it('includes pending games only in categories the players entered', () => {
    const { event, tournament, playersHandler } = parseFixture();
    const { players, countries } = calculateStats(event, [tournament], playersHandler);

    for (const player of Object.values(players)) {
      assert.equal(filterPlayerStatsByCategory(player, 'open').totalUnresolved, 2);
      assert.equal(filterPlayerStatsByCategory(player, 'other').totalUnresolved, 0);
    }
    for (const country of Object.values(countries)) {
      assert.equal(filterCountryStatsByCategory(country, 'open').totalUnresolved, 2);
      assert.equal(filterCountryStatsByCategory(country, 'other').totalUnresolved, 0);
    }
  });
});

function parseFixture() {
  const event: EventDefinition = { id: 'wagc', locales: ['en'], categories: ['open', 'other'] };
  const playersHandler = createPlayersHandler();
  const playersMap: Record<string, Player> = {};
  const gamesMap: Record<string, Game> = {};
  const tournamentDetails = { year: 2026, top: [] };
  const stage = parseH9Tournament(
    {
      event,
      stage: {
        type: 'tournament',
        file: 'unused.txt',
        date: '2026-09-08',
        category: 'open',
        customBreakers: {},
      },
      stageIndex: 0,
      playersHandler,
      playersMap,
      gamesMap,
      tournamentDetails,
    },
    H9_RESULTS
  );
  const tournament: Tournament = {
    ...tournamentDetails,
    id: 2026,
    stages: [stage],
    games: gamesMap,
    players: playersMap,
    hasSgfs: false,
  };

  return { event, stage, tournament, playersHandler };
}
