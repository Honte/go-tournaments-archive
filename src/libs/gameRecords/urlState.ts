import { normalizeRank } from '@/libs/h9';
import { compareKomi, isKnown, uniqueKnown, uniqueKomi } from './filters';
import {
  DEFAULT_GAME_BROWSER_STATE,
  GAME_GROUPS,
  GAME_MEDIA,
  GAME_RESULT_TYPES,
  GAME_SORTS,
  GAME_WINNERS,
  type GameBrowserState,
  PLAYER_COLORS,
  QUERY_KEYS,
  type SearchParamsReader,
} from './schema';

export function parseGameBrowserState(params: SearchParamsReader): GameBrowserState {
  const years = uniqueNumbers(params.getAll('year'));
  const results = uniqueKnown(params.getAll('result'), GAME_RESULT_TYPES);
  const komi = uniqueKomi(params.getAll('komi'));
  const media = uniqueKnown(params.getAll('has'), GAME_MEDIA);
  const winner = params.get('winner');
  const playerColor = params.get('playerColor');
  const sort = params.get('sort');
  const group = params.get('group');

  return {
    player: readString(params, 'player'),
    country: readString(params, 'country')?.toUpperCase(),
    opponent: readString(params, 'opponent'),
    opponentCountry: readString(params, 'opponentCountry')?.toUpperCase(),
    category: readString(params, 'category'),
    playerColor: isKnown(playerColor, PLAYER_COLORS) ? playerColor : undefined,
    playerRankMin: normalizeRank(params.get('playerRankMin')),
    playerRankMax: normalizeRank(params.get('playerRankMax')),
    opponentRankMin: normalizeRank(params.get('opponentRankMin')),
    opponentRankMax: normalizeRank(params.get('opponentRankMax')),
    years,
    movesMin: readNumber(params, 'movesMin'),
    movesMax: readNumber(params, 'movesMax'),
    results,
    komi,
    winner: isKnown(winner, GAME_WINNERS) ? winner : undefined,
    media,
    sort: isKnown(sort, GAME_SORTS) ? sort : DEFAULT_GAME_BROWSER_STATE.sort,
    group: isKnown(group, GAME_GROUPS) ? group : DEFAULT_GAME_BROWSER_STATE.group,
  };
}

export function serializeGameBrowserState(state: GameBrowserState, source: URLSearchParams = new URLSearchParams()) {
  const params = new URLSearchParams(source);
  for (const key of QUERY_KEYS) {
    params.delete(key);
  }
  setString(params, 'player', state.player);
  setString(params, 'country', state.country?.toUpperCase());
  setString(params, 'opponent', state.opponent);
  setString(params, 'opponentCountry', state.opponentCountry?.toUpperCase());
  setString(params, 'category', state.category);
  setString(params, 'playerColor', state.playerColor);
  setString(params, 'playerRankMin', normalizeRank(state.playerRankMin));
  setString(params, 'playerRankMax', normalizeRank(state.playerRankMax));
  setString(params, 'opponentRankMin', normalizeRank(state.opponentRankMin));
  setString(params, 'opponentRankMax', normalizeRank(state.opponentRankMax));
  for (const year of uniqueNumbers(state.years.map(String)).toSorted((a, b) => b - a)) {
    params.append('year', String(year));
  }
  setNumber(params, 'movesMin', state.movesMin);
  setNumber(params, 'movesMax', state.movesMax);
  for (const result of GAME_RESULT_TYPES) {
    if (state.results.includes(result)) {
      params.append('result', result);
    }
  }
  for (const komi of uniqueKomi(state.komi).toSorted(compareKomi)) {
    params.append('komi', komi);
  }
  if (state.winner) {
    params.set('winner', state.winner);
  }
  for (const medium of GAME_MEDIA) {
    if (state.media.includes(medium)) {
      params.append('has', medium);
    }
  }
  if (state.sort !== DEFAULT_GAME_BROWSER_STATE.sort) {
    params.set('sort', state.sort);
  }
  if (state.group !== DEFAULT_GAME_BROWSER_STATE.group) {
    params.set('group', state.group);
  }
  return params;
}

function readString(params: SearchParamsReader, key: string) {
  const value = params.get(key)?.trim();
  return value || undefined;
}

function readNumber(params: SearchParamsReader, key: string) {
  const value = readString(params, key);
  const number = Number(value);
  return value !== undefined && Number.isFinite(number) && number >= 0 ? number : undefined;
}

function setString(params: URLSearchParams, key: string, value?: string) {
  if (value) {
    params.set(key, value);
  }
}

function setNumber(params: URLSearchParams, key: string, value?: number) {
  if (value !== undefined && Number.isFinite(value)) {
    params.set(key, String(value));
  }
}

function uniqueNumbers(values: readonly string[]) {
  return [...new Set(values.map(Number).filter((value) => Number.isInteger(value) && value >= 0))];
}
