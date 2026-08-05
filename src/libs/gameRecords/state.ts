import type { ApiGameInfo } from '@/schema/api';
import { normalizeRank } from '@/libs/h9';
import { getRankValue } from '@/libs/rank';
import { getOrientations, isKnown, type OrientedGame, uniqueKnown, uniqueKomi } from './filters';
import {
  DEFAULT_GAME_BROWSER_STATE,
  GAME_GROUPS,
  GAME_MEDIA,
  GAME_RESULT_TYPES,
  GAME_SORTS,
  GAME_WINNERS,
  PLAYER_COLORS,
  type GameRecordsState,
} from './schema';

export type GameGroupEligibility = {
  opponentPlayer: boolean;
  opponentCountry: boolean;
  countryPlayer: boolean;
  category: boolean;
};

export function normalizeGameBrowserState(
  games: readonly ApiGameInfo[],
  requested: GameRecordsState,
  options: { countriesEnabled?: boolean; categoriesEnabled?: boolean } = {}
): GameRecordsState {
  const players = getPlayers(games);
  const countries = getCountries(games);
  const categories = getCategories(games);
  const years = new Set(games.map((game) => game.tournament));
  const komiValues = new Set(games.flatMap((game) => (game.komi === undefined ? [] : [formatKomi(game.komi)])));
  const countriesEnabled = options.countriesEnabled ?? true;
  const categoriesEnabled = options.categoriesEnabled ?? true;
  const state: GameRecordsState = {
    ...requested,
    results: uniqueKnown(requested.results, GAME_RESULT_TYPES),
    komi: uniqueKomi(requested.komi).filter((komi) => komiValues.has(komi)),
    media: uniqueKnown(requested.media, GAME_MEDIA),
    winner: isKnown(requested.winner, GAME_WINNERS) ? requested.winner : undefined,
    playerColor: isKnown(requested.playerColor, PLAYER_COLORS) ? requested.playerColor : undefined,
    sort: isKnown(requested.sort, GAME_SORTS) ? requested.sort : DEFAULT_GAME_BROWSER_STATE.sort,
    group: isKnown(requested.group, GAME_GROUPS) ? requested.group : DEFAULT_GAME_BROWSER_STATE.group,
    years: uniqueNumbers(requested.years)
      .filter((year) => years.has(year))
      .toSorted((a, b) => b - a),
    playerRankMin: normalizeRank(requested.playerRankMin),
    playerRankMax: normalizeRank(requested.playerRankMax),
    opponentRankMin: normalizeRank(requested.opponentRankMin),
    opponentRankMax: normalizeRank(requested.opponentRankMax),
  };
  state.player = state.player && players.has(state.player) ? state.player : undefined;
  state.category = categoriesEnabled && state.category && categories.has(state.category) ? state.category : undefined;
  state.country =
    countriesEnabled && state.country && countries.has(state.country.toUpperCase())
      ? state.country.toUpperCase()
      : undefined;
  if (state.player && state.country && !hasStructuralMatch(games, { player: state.player, country: state.country })) {
    state.country = undefined;
  }
  if ((state.winner === 'player' || state.winner === 'player-opponent') && !state.player) {
    state.winner = undefined;
  }
  if ((state.winner === 'country' || state.winner === 'country-opponent') && !state.country) {
    state.winner = undefined;
  }
  state.opponent =
    state.player &&
    state.opponent &&
    players.has(state.opponent) &&
    hasStructuralMatch(games, { player: state.player, country: state.country, opponent: state.opponent })
      ? state.opponent
      : undefined;
  state.opponentCountry =
    countriesEnabled &&
    (state.player || state.country) &&
    state.opponentCountry &&
    countries.has(state.opponentCountry.toUpperCase()) &&
    hasStructuralMatch(games, {
      player: state.player,
      country: state.country,
      opponent: state.opponent,
      opponentCountry: state.opponentCountry.toUpperCase(),
    })
      ? state.opponentCountry.toUpperCase()
      : undefined;
  normalizeRange(state, 'movesMin', 'movesMax');
  normalizeRankRange(state, 'playerRankMin', 'playerRankMax');
  normalizeRankRange(state, 'opponentRankMin', 'opponentRankMax');
  if (!state.player && !state.country) {
    state.opponentRankMin = state.opponentRankMax = undefined;
  }
  return groupingForState(
    state,
    getGameGroupEligibility(state, countriesEnabled, categoriesEnabled && Boolean(categories.size))
  );
}

export function getGameGroupEligibility(
  state: GameRecordsState,
  countriesEnabled = true,
  categoriesEnabled = false
): GameGroupEligibility {
  return {
    opponentPlayer: Boolean((state.player || state.country) && !state.opponent),
    opponentCountry: Boolean(
      countriesEnabled && (state.player || state.country) && !state.opponent && !state.opponentCountry
    ),
    countryPlayer: Boolean(countriesEnabled && state.country && !state.player),
    category: categoriesEnabled && !state.category,
  };
}

export function groupingForState(state: GameRecordsState, eligibility: GameGroupEligibility): GameRecordsState {
  if (
    (state.group === 'opponent-player' && !eligibility.opponentPlayer) ||
    (state.group === 'opponent-country' && !eligibility.opponentCountry) ||
    (state.group === 'country-player' && !eligibility.countryPlayer) ||
    (state.group === 'category' && !eligibility.category)
  ) {
    return { ...state, group: 'none' };
  }
  return state;
}

export function getPlayers(games: readonly ApiGameInfo[]) {
  return new Set(games.flatMap((game) => [game.black.id, game.white.id]));
}

export function getCountries(games: readonly ApiGameInfo[]) {
  return new Set(
    games
      .flatMap((game) => [game.black.country, game.white.country])
      .filter((country): country is string => Boolean(country))
      .map((country) => country.toUpperCase())
  );
}

export function getCategories(games: readonly ApiGameInfo[]) {
  return new Set(games.map((game) => game.category).filter((category): category is string => Boolean(category)));
}

function hasStructuralMatch(games: readonly ApiGameInfo[], filters: Partial<GameRecordsState>) {
  return games.some((game) =>
    getOrientations(game).some((orientation) => matchesStructuralFilters(orientation, filters))
  );
}

function matchesStructuralFilters(orientation: OrientedGame, filters: Partial<GameRecordsState>) {
  return (
    (!filters.player || orientation.player.id === filters.player) &&
    (!filters.country || orientation.player.country?.toUpperCase() === filters.country.toUpperCase()) &&
    (!filters.opponent || orientation.opponent.id === filters.opponent) &&
    (!filters.opponentCountry || orientation.opponent.country?.toUpperCase() === filters.opponentCountry.toUpperCase())
  );
}

function normalizeRange(state: GameRecordsState, minimum: 'movesMin', maximum: 'movesMax') {
  if (state[minimum] !== undefined && state[maximum] !== undefined && state[minimum]! > state[maximum]!) {
    [state[minimum], state[maximum]] = [state[maximum], state[minimum]];
  }
}

function normalizeRankRange(
  state: GameRecordsState,
  minimum: 'playerRankMin' | 'opponentRankMin',
  maximum: 'playerRankMax' | 'opponentRankMax'
) {
  if (state[minimum] && state[maximum] && getRankValue(state[minimum])! > getRankValue(state[maximum])!) {
    [state[minimum], state[maximum]] = [state[maximum], state[minimum]];
  }
}

function uniqueNumbers(values: readonly number[]) {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value >= 0))];
}

function formatKomi(komi: number) {
  return Number.isInteger(komi) ? String(komi) : String(komi).replace(/\.0+$/, '');
}
