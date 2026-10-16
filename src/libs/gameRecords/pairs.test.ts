import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { ApiGameInfo } from '@/schema/api';
import { createPair } from '@/libs/participants';
import { buildGameRecordsModel } from './model';
import { DEFAULT_GAME_RECORDS_STATE } from './schema';
import { parseGameRecordsState, serializeGameRecordsState } from './urlState';

const a = { id: 'a', name: 'Alice One', rank: '1k' };
const b = { id: 'b', name: 'Bob Two', rank: '7d' };
const c = { id: 'c', name: 'Carol Three' };
const d = { id: 'd', name: 'Dan Four' };
const games: ApiGameInfo[] = [
  {
    sgf: '1.sgf',
    tournament: 2025,
    stage: 0,
    moves: 10,
    black: createPair([a, b], '3d', 'JP'),
    white: createPair([c, d], '2d', 'JP'),
    winner: 'black',
  },
  {
    sgf: '2.sgf',
    tournament: 2026,
    stage: 0,
    moves: 10,
    white: createPair([a, c], '1d', 'GB'),
    black: createPair([d, b], '4d', 'JP'),
    winner: 'white',
  },
];

it('filters by all four members and pair ranks without duplicating games', () => {
  const state = {
    ...DEFAULT_GAME_RECORDS_STATE,
    player: 'a',
    partner: 'b',
    opponent: 'c',
    opponentPartner: 'd',
    playerRankMin: '3d',
  };
  const model = buildGameRecordsModel(games, state, { pairs: true });
  assert.equal(model.filteredCount, 1);
  assert.equal(model.games[0].sgf, '1.sgf');
  assert.equal(buildGameRecordsModel(games, { ...state, playerRankMin: '4d' }).filteredCount, 0);
  assert.equal(buildGameRecordsModel(games, { ...DEFAULT_GAME_RECORDS_STATE, country: 'JP' }).filteredCount, 2);
  assert.equal(model.facets.partner.options.find((p) => p.value === 'b')?.count, 1);
  const restored = parseGameRecordsState(serializeGameRecordsState(state));
  assert.equal(restored.partner, 'b');
  assert.equal(restored.opponentPartner, 'd');
});

it('groups by partner or opposing pair and clears invalid dependencies', () => {
  for (const group of ['partner', 'opponent-pair'] as const) {
    const model = buildGameRecordsModel(games, { ...DEFAULT_GAME_RECORDS_STATE, player: 'a', group }, { pairs: true });
    assert.equal(model.groups.length, 2);
    assert.equal(model.groups.flatMap((g) => g.games).length, 2);
    assert.equal(model.grouping.opponentPlayer, false);
    assert.equal(buildGameRecordsModel(games, { ...DEFAULT_GAME_RECORDS_STATE, group }).state.group, 'none');
  }
  assert.equal(
    buildGameRecordsModel(games, { ...DEFAULT_GAME_RECORDS_STATE, player: 'a', partner: 'd' }).state.partner,
    undefined
  );
  assert.equal(buildGameRecordsModel(games, { ...DEFAULT_GAME_RECORDS_STATE, partner: 'b' }).state.partner, undefined);
});
