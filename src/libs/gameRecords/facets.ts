import type { ApiGameInfo } from '@/schema/api';
import { normalizeRank } from '@/libs/h9';
import { getRankValue } from '@/libs/rank';
import {
  compareKomi,
  filterGameRecords,
  formatKomi,
  getOrientations,
  matchesGlobalFilters,
  matchesOrientation,
  UNKNOWN_KOMI,
  type FacetKey,
  type OrientedGame,
} from './filters';
import { getPlayerMeta } from './grouping';
import {
  DEFAULT_GAME_RECORDS_STATE,
  GAME_MEDIA,
  GAME_RESULT_TYPES,
  GAME_WINNERS,
  PLAYER_COLORS,
  type GameRecordsDomains,
  type GameRecordsState,
  type GameFacet,
  type GameMedia,
  type GameResultType,
  type GameWinner,
  type PlayerColor,
} from './schema';

export function buildGameRecordsFacets(
  games: readonly ApiGameInfo[],
  state: GameRecordsState,
  options: {
    countriesEnabled: boolean;
    categoriesEnabled: boolean;
    countryLabel: (country: string) => string;
    categoryLabel: (category: string) => string;
    unknownKomiLabel: string;
  }
) {
  const playerMeta = getPlayerMeta(games);
  const hasCountries = Boolean(getCountries(games).size);
  const hasCategories = options.categoriesEnabled && Boolean(getCategories(games).size);
  return {
    player: buildPlayerFacet(games, state, 'player', playerMeta, true),
    country: buildCountryFacet(games, state, 'country', options.countryLabel, options.countriesEnabled, hasCountries),
    opponent: buildPlayerFacet(games, state, 'opponent', playerMeta, Boolean(state.player)),
    opponentCountry: buildCountryFacet(
      games,
      state,
      'opponentCountry',
      options.countryLabel,
      options.countriesEnabled,
      Boolean(state.player || state.country)
    ),
    category: buildCategoryFacet(games, state, options.categoryLabel, hasCategories),
    playerColor: buildColorFacetCounts(games, state),
    year: buildYearFacet(games, state),
    result: buildResultFacetCounts(games, state),
    komi: buildKomiFacet(games, state, options.unknownKomiLabel),
    winner: buildWinnerFacetCounts(games, state),
    media: buildMediaFacetCounts(games, state),
  };
}

export function getGameRecordsDomains(games: readonly ApiGameInfo[]): GameRecordsDomains {
  const ranks = new Set<string>();
  for (const game of games) {
    for (const rank of [game.black.rank, game.white.rank]) {
      const normalized = normalizeRank(rank);
      if (getRankValue(rank) && normalized) {
        ranks.add(normalized);
      }
    }
  }
  const moves = games.map((game) => game.moves);
  return {
    ranks: [...ranks].toSorted((a, b) => getRankValue(a)! - getRankValue(b)!),
    years: [...new Set(games.map((game) => game.tournament))].toSorted((a, b) => b - a),
    movesMin: moves.length ? Math.min(...moves) : undefined,
    movesMax: moves.length ? Math.max(...moves) : undefined,
  };
}

function buildPlayerFacet(
  games: readonly ApiGameInfo[],
  state: GameRecordsState,
  facet: 'player' | 'opponent',
  meta: ReturnType<typeof getPlayerMeta>,
  visible: boolean
): GameFacet {
  const counts = countFacet(games, state, facet);
  const selected = state[facet];
  const values = new Set(counts.keys());
  if (selected && meta.has(selected)) {
    values.add(selected);
  }
  return {
    visible,
    options: [...values]
      .map((value) => {
        const details = meta.get(value);
        return {
          value,
          label: details?.label ?? value,
          count: counts.get(value) ?? 0,
          search: details ? [...details.aliases].join(' ') : value,
        };
      })
      .toSorted((a, b) => b.count - a.count || a.label.localeCompare(b.label) || a.value.localeCompare(b.value)),
  };
}

function buildCountryFacet(
  games: readonly ApiGameInfo[],
  state: GameRecordsState,
  facet: 'country' | 'opponentCountry',
  countryLabel: (country: string) => string,
  countriesEnabled: boolean,
  visible: boolean
): GameFacet {
  if (!countriesEnabled) {
    return { visible: false, options: [] };
  }
  const counts = countFacet(games, state, facet);
  const values = new Set(counts.keys());
  if (state[facet]) {
    values.add(state[facet]);
  }
  return {
    visible,
    options: [...values]
      .map((value) => ({ value, label: countryLabel(value), count: counts.get(value) ?? 0, search: value }))
      .toSorted((a, b) => a.label.localeCompare(b.label) || a.value.localeCompare(b.value)),
  };
}

function buildCategoryFacet(
  games: readonly ApiGameInfo[],
  state: GameRecordsState,
  categoryLabel: (category: string) => string,
  visible: boolean
): GameFacet {
  if (!visible) {
    return { visible: false, options: [] };
  }
  const counts = new Map<string, number>();
  for (const match of filterGameRecords(games, { ...state, category: undefined })) {
    if (match.game.category) {
      counts.set(match.game.category, (counts.get(match.game.category) ?? 0) + 1);
    }
  }
  const values = new Set(counts.keys());
  if (state.category) {
    values.add(state.category);
  }
  return {
    visible: true,
    options: [...values]
      .map((value) => ({ value, label: categoryLabel(value), count: counts.get(value) ?? 0 }))
      .toSorted((a, b) => a.label.localeCompare(b.label) || a.value.localeCompare(b.value)),
  };
}

function buildYearFacet(games: readonly ApiGameInfo[], state: GameRecordsState): GameFacet {
  const counts = new Map<number, number>();
  for (const match of filterGameRecords(games, { ...state, years: [] })) {
    counts.set(match.game.tournament, (counts.get(match.game.tournament) ?? 0) + 1);
  }
  const values = new Set([...counts.keys(), ...state.years]);
  return {
    visible: true,
    options: [...values]
      .map((year) => ({ value: String(year), label: String(year), count: counts.get(year) ?? 0 }))
      .toSorted((a, b) => Number(b.value) - Number(a.value)),
  };
}

function buildMediaFacetCounts(games: readonly ApiGameInfo[], state: GameRecordsState) {
  return Object.fromEntries(
    GAME_MEDIA.map((medium) => [
      medium,
      filterGameRecords(games, {
        ...state,
        media: state.media.includes(medium) ? state.media : [...state.media, medium],
      }).length,
    ])
  ) as Record<GameMedia, number>;
}

function buildResultFacetCounts(games: readonly ApiGameInfo[], state: GameRecordsState) {
  const context = getGameFacetContext(state);
  return Object.fromEntries(
    GAME_RESULT_TYPES.map((result) => [result, filterGameRecords(games, { ...context, results: [result] }).length])
  ) as Record<GameResultType, number>;
}

function buildKomiFacet(games: readonly ApiGameInfo[], state: GameRecordsState, unknownKomiLabel: string): GameFacet {
  const counts = new Map<string, number>();
  for (const match of filterGameRecords(games, { ...state, komi: [] })) {
    const komi = formatKomi(match.game.komi);
    counts.set(komi, (counts.get(komi) ?? 0) + 1);
  }
  const values = new Set([...counts.keys(), ...state.komi]);
  return {
    visible: new Set(games.map((game) => formatKomi(game.komi))).size > 1,
    options: [...values]
      .map((value) => ({
        value,
        label: value === UNKNOWN_KOMI ? unknownKomiLabel : value,
        count: counts.get(value) ?? 0,
      }))
      .toSorted((a, b) => compareKomi(a.value, b.value)),
  };
}

function buildWinnerFacetCounts(games: readonly ApiGameInfo[], state: GameRecordsState) {
  const context = getGameFacetContext(state);
  return Object.fromEntries(
    GAME_WINNERS.map((winner) => [winner, filterGameRecords(games, { ...context, winner }).length])
  ) as Record<GameWinner, number>;
}

function buildColorFacetCounts(games: readonly ApiGameInfo[], state: GameRecordsState) {
  return Object.fromEntries(
    PLAYER_COLORS.map((color) => [color, filterGameRecords(games, { ...state, playerColor: color }).length])
  ) as Record<PlayerColor, number>;
}

function getGameFacetContext(state: GameRecordsState): GameRecordsState {
  return {
    ...DEFAULT_GAME_RECORDS_STATE,
    player: state.player,
    country: state.country,
    opponent: state.opponent,
    opponentCountry: state.opponentCountry,
    playerColor: state.playerColor,
  };
}

function countFacet(games: readonly ApiGameInfo[], state: GameRecordsState, facet: FacetKey) {
  const counts = new Map<string, number>();
  for (const game of games) {
    if (!matchesGlobalFilters(game, state)) {
      continue;
    }
    const values = new Set<string>();
    for (const orientation of getOrientations(game)) {
      if (matchesOrientation(orientation, state, facet)) {
        const value = getFacetValue(orientation, facet);
        if (value) {
          values.add(value);
        }
      }
    }
    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

function getFacetValue(orientation: OrientedGame, facet: FacetKey) {
  switch (facet) {
    case 'player':
      return orientation.player.id;
    case 'country':
      return orientation.player.country?.toUpperCase();
    case 'opponent':
      return orientation.opponent.id;
    case 'opponentCountry':
      return orientation.opponent.country?.toUpperCase();
    case 'playerColor':
      return orientation.playerColor;
  }
}

function getCountries(games: readonly ApiGameInfo[]) {
  return new Set(games.flatMap((game) => [game.black.country, game.white.country]).filter(Boolean));
}

function getCategories(games: readonly ApiGameInfo[]) {
  return new Set(games.map((game) => game.category).filter(Boolean));
}
