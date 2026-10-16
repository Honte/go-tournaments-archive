import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { PlayerGame, PlayerStats } from '@/schema/data';
import { getOpponentRows, getPartnerRows } from './pairStats';
import { createPair } from './participants';

it('counts opponents as members or pairs and excludes BYE games', () => {
  const opponent = createPair([
    { id: 'c', name: 'Carol Three' },
    { id: 'd', name: 'Dan Four' },
  ]);
  const games: PlayerGame[] = [
    { id: opponent.id, opponent, won: true, result: 'B+R', props: { sgf: '2025/game.sgf' } },
    { id: opponent.id, opponent, won: false, drawn: true, result: 'jigo' },
    { id: opponent.id, opponent, won: false, unresolved: true, result: '?' },
    { id: 'BYE', won: true, result: '+' },
  ];
  const player = createPlayerStats(games);
  for (const pairs of [false, true]) {
    const rows = getOpponentRows(player, pairs);
    assert.equal(rows.length, pairs ? 1 : 2);
    for (const row of rows) {
      assert.equal(row.games, 2);
      assert.equal(row.won, 1);
      assert.equal(row.drawn, 1);
      assert.equal(row.unresolved, 1);
      assert.equal(row.lost, 0);
      assert.equal(row.sgfs, 1);
    }
  }
  const partner = getPartnerRows(player)[0];
  assert.equal(partner.games, 3);
  assert.equal(partner.gold, 1);
});

it('keeps partner attendance and medals independent between editions', () => {
  const player = createPlayerStats([]);
  player.results.push({
    ...player.results[0],
    year: 2026,
    partner: { id: 'c', name: 'Carol Three' },
  });
  player.medals[0].push('2026');
  assert.deepEqual(
    getPartnerRows(player).map((row) => [row.name, row.attended, row.gold]),
    [
      ['Carol Three', 1, 1],
      ['Bob Two', 1, 1],
    ]
  );
});

function createPlayerStats(games: PlayerGame[]): PlayerStats {
  return {
    id: 'a',
    name: 'Alice One',
    country: ['JP'],
    medals: [['2025'], [], []],
    categoriesMedals: {},
    opponents: { c: 'Carol Three', d: 'Dan Four' },
    results: [
      {
        year: 2025,
        name: 'Alice One',
        place: 1,
        partner: { id: 'b', name: 'Bob Two' },
        stages: [{ type: 'tournament', place: 1, games, categories: {} }],
      },
    ],
    bestPlace: 1,
    totalAttended: 1,
    totalGames: 0,
    totalWon: 0,
    totalDrawn: 0,
    totalUnresolved: 0,
    totalSgfs: 0,
    score: 0,
  };
}
