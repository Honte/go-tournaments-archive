import type { ApiGameInfo } from '@/schema/api';
import type { Player } from '@/schema/data';

export const GAME_RESULT_TYPES = ['resignation', 'points', 'time', 'other'] as const;
export const GAME_MEDIA = ['ogs', 'yt', 'ai'] as const;
export const GAME_WINNERS = ['black', 'white', 'player', 'opponent'] as const;
export const PLAYER_COLORS = ['black', 'white'] as const;
export const GAME_SORTS = [
  'year-desc',
  'year-asc',
  'moves-desc',
  'moves-asc',
  'black-rank-desc',
  'black-rank-asc',
  'white-rank-desc',
  'white-rank-asc',
  'rank-gap-asc',
  'rank-gap-desc',
] as const;
export const GAME_GROUPS = [
  'none',
  'opponent-player',
  'opponent-country',
  'country-player',
  'year',
  'category',
] as const;

export type GameResultType = (typeof GAME_RESULT_TYPES)[number];
export type GameMedia = (typeof GAME_MEDIA)[number];
export type GameWinner = (typeof GAME_WINNERS)[number];
export type PlayerColor = (typeof PLAYER_COLORS)[number];
export type GameSort = (typeof GAME_SORTS)[number];
export type GameGroup = (typeof GAME_GROUPS)[number];

export type GameBrowserState = {
  player?: string;
  country?: string;
  opponent?: string;
  opponentCountry?: string;
  category?: string;
  playerColor?: PlayerColor;
  playerRankMin?: string;
  playerRankMax?: string;
  opponentRankMin?: string;
  opponentRankMax?: string;
  years: number[];
  movesMin?: number;
  movesMax?: number;
  results: GameResultType[];
  komi: string[];
  winner?: GameWinner;
  media: GameMedia[];
  sort: GameSort;
  group: GameGroup;
};

export const DEFAULT_GAME_BROWSER_STATE: GameBrowserState = {
  years: [],
  results: [],
  komi: [],
  media: [],
  sort: 'year-desc',
  group: 'none',
};

export type GameFacetOption = {
  value: string;
  label: string;
  count: number;
  search?: string;
};

export type GameFacet = {
  visible: boolean;
  options: GameFacetOption[];
};

export type GameBrowserGroupResult = {
  key: string;
  label?: string;
  games: ApiGameInfo[];
};

export type GameBrowserDomains = {
  ranks: string[];
  years: number[];
  movesMin?: number;
  movesMax?: number;
};

export type GameBrowserModel = {
  state: GameBrowserState;
  totalCount: number;
  filteredCount: number;
  games: ApiGameInfo[];
  groups: GameBrowserGroupResult[];
  facets: {
    player: GameFacet;
    country: GameFacet;
    opponent: GameFacet;
    opponentCountry: GameFacet;
    category: GameFacet;
    playerColor: Record<PlayerColor, number>;
    year: GameFacet;
    result: Record<GameResultType, number>;
    komi: GameFacet;
    winner: Record<GameWinner, number>;
    media: Record<GameMedia, number>;
  };
  domains: GameBrowserDomains;
  grouping: {
    opponentPlayer: boolean;
    opponentCountry: boolean;
    countryPlayer: boolean;
    category: boolean;
  };
};

export type GameBrowserOptions = {
  countriesEnabled?: boolean;
  categoriesEnabled?: boolean;
  countryLabel?: (country: string) => string;
  categoryLabel?: (category: string) => string;
  unknownCountryLabel?: string;
  locale?: string;
};

type SearchParamsReader = Pick<URLSearchParams, 'get' | 'getAll'>;
type FacetKey = 'player' | 'country' | 'opponent' | 'opponentCountry' | 'playerColor';

type OrientedGame = {
  game: ApiGameInfo;
  player: Player;
  opponent: Player;
  playerColor: PlayerColor;
};

type GameMatch = OrientedGame;

type PlayerMeta = {
  label: string;
  aliases: Set<string>;
  latestTournament: number;
};

const QUERY_KEYS = [
  'player',
  'country',
  'opponent',
  'opponentCountry',
  'category',
  'playerColor',
  'playerRankMin',
  'playerRankMax',
  'opponentRankMin',
  'opponentRankMax',
  'year',
  'yearMin',
  'yearMax',
  'movesMin',
  'movesMax',
  'result',
  'komi',
  'winner',
  'has',
  'sort',
  'group',
] as const;

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
  const params = clearGameBrowserSearchParams(source);
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

export function clearGameBrowserSearchParams(source: URLSearchParams) {
  const params = new URLSearchParams(source);

  for (const key of QUERY_KEYS) {
    params.delete(key);
  }

  return params;
}

export function getGameBrowserStateKey(state: GameBrowserState) {
  return serializeGameBrowserState(state).toString();
}

export function getActiveGameFilterCount(state: GameBrowserState) {
  return [
    state.player,
    state.country,
    state.opponent,
    state.opponentCountry,
    state.category,
    state.playerColor,
    state.playerRankMin || state.playerRankMax,
    state.opponentRankMin || state.opponentRankMax,
    state.years.length > 0,
    state.movesMin !== undefined || state.movesMax !== undefined,
    state.results.length > 0,
    state.komi.length > 0,
    state.winner,
    state.media.length > 0,
    state.sort !== DEFAULT_GAME_BROWSER_STATE.sort,
    state.group !== DEFAULT_GAME_BROWSER_STATE.group,
  ].filter(Boolean).length;
}

export function deriveGameBrowserModel(
  games: readonly ApiGameInfo[],
  requestedState: GameBrowserState,
  options: GameBrowserOptions = {}
): GameBrowserModel {
  const playerMeta = getPlayerMeta(games);
  const countriesEnabled = options.countriesEnabled ?? true;
  const categoriesEnabled = options.categoriesEnabled ?? true;
  const countryLabel = options.countryLabel ?? ((country: string) => country);
  const categoryLabel = options.categoryLabel ?? ((category: string) => category);
  const hasCategories = categoriesEnabled && Boolean(getCategories(games).size);
  const state = normalizeGameBrowserState(games, requestedState, { countriesEnabled, categoriesEnabled });
  const matches = sortGameRecords(filterGameRecords(games, state), state.sort);
  const grouping = getGameGroupEligibility(state, countriesEnabled, hasCategories);
  const normalizedState = groupingForState(state, grouping);
  const normalizedMatches =
    normalizedState === state ? matches : sortGameRecords(filterGameRecords(games, normalizedState), state.sort);

  return {
    state: normalizedState,
    totalCount: games.length,
    filteredCount: normalizedMatches.length,
    games: normalizedMatches.map((match) => match.game),
    groups: groupGameRecords(normalizedMatches, normalizedState, {
      playerMeta,
      countryLabel,
      categoryLabel,
      unknownCountryLabel: options.unknownCountryLabel ?? '?',
      locale: options.locale,
    }),
    facets: {
      player: buildPlayerFacet(games, normalizedState, 'player', playerMeta, true),
      country: buildCountryFacet(
        games,
        normalizedState,
        'country',
        countryLabel,
        countriesEnabled,
        Boolean(getCountries(games).size)
      ),
      opponent: buildPlayerFacet(games, normalizedState, 'opponent', playerMeta, Boolean(normalizedState.player)),
      opponentCountry: buildCountryFacet(
        games,
        normalizedState,
        'opponentCountry',
        countryLabel,
        countriesEnabled,
        Boolean(normalizedState.player || normalizedState.country)
      ),
      category: buildCategoryFacet(games, normalizedState, categoryLabel, hasCategories),
      playerColor: buildColorFacetCounts(games, normalizedState, 'playerColor'),
      year: buildYearFacet(games, normalizedState),
      result: buildResultFacetCounts(games, normalizedState),
      komi: buildKomiFacet(games, normalizedState),
      winner: buildWinnerFacetCounts(games, normalizedState),
      media: buildMediaFacetCounts(games, normalizedState),
    },
    domains: getGameBrowserDomains(games),
    grouping,
  };
}

export function normalizeGameBrowserState(
  games: readonly ApiGameInfo[],
  requested: GameBrowserState,
  options: { countriesEnabled?: boolean; categoriesEnabled?: boolean } = {}
): GameBrowserState {
  const players = getPlayers(games);
  const countries = getCountries(games);
  const categories = getCategories(games);
  const years = new Set(games.map((game) => game.tournament));
  const komiValues = new Set(games.flatMap((game) => (game.komi === undefined ? [] : [formatKomi(game.komi)])));
  const countriesEnabled = options.countriesEnabled ?? true;
  const categoriesEnabled = options.categoriesEnabled ?? true;
  const state: GameBrowserState = {
    ...requested,
    results: uniqueKnown(requested.results, GAME_RESULT_TYPES),
    komi: uniqueKomi(requested.komi).filter((komi) => komiValues.has(komi)),
    media: uniqueKnown(requested.media, GAME_MEDIA),
    winner: isKnown(requested.winner, GAME_WINNERS) ? requested.winner : undefined,
    playerColor: isKnown(requested.playerColor, PLAYER_COLORS) ? requested.playerColor : undefined,
    sort: isKnown(requested.sort, GAME_SORTS) ? requested.sort : DEFAULT_GAME_BROWSER_STATE.sort,
    group: isKnown(requested.group, GAME_GROUPS) ? requested.group : DEFAULT_GAME_BROWSER_STATE.group,
    years: uniqueNumbers(requested.years.map(String))
      .filter((year) => years.has(year))
      .toSorted((a, b) => b - a),
    playerRankMin: normalizeRank(requested.playerRankMin),
    playerRankMax: normalizeRank(requested.playerRankMax),
    opponentRankMin: normalizeRank(requested.opponentRankMin),
    opponentRankMax: normalizeRank(requested.opponentRankMax),
  };

  if (!state.player || !players.has(state.player)) {
    state.player = undefined;
  }

  if (!categoriesEnabled || !state.category || !categories.has(state.category)) {
    state.category = undefined;
  }

  if ((state.winner === 'player' || state.winner === 'opponent') && !state.player) {
    state.winner = undefined;
  }

  if (!countriesEnabled || !state.country || !countries.has(state.country.toUpperCase())) {
    state.country = undefined;
  } else {
    state.country = state.country.toUpperCase();
  }

  if (state.player && state.country && !hasStructuralMatch(games, { player: state.player, country: state.country })) {
    state.country = undefined;
  }

  if (!state.player) {
    state.opponent = undefined;
  } else if (
    !state.opponent ||
    !players.has(state.opponent) ||
    !hasStructuralMatch(games, {
      player: state.player,
      country: state.country,
      opponent: state.opponent,
    })
  ) {
    state.opponent = undefined;
  }

  if (!countriesEnabled || (!state.player && !state.country)) {
    state.opponentCountry = undefined;
  } else if (
    !state.opponentCountry ||
    !countries.has(state.opponentCountry.toUpperCase()) ||
    !hasStructuralMatch(games, {
      player: state.player,
      country: state.country,
      opponent: state.opponent,
      opponentCountry: state.opponentCountry.toUpperCase(),
    })
  ) {
    state.opponentCountry = undefined;
  } else {
    state.opponentCountry = state.opponentCountry.toUpperCase();
  }

  normalizeRange(state, 'movesMin', 'movesMax');
  normalizeRankRange(state, 'playerRankMin', 'playerRankMax');
  normalizeRankRange(state, 'opponentRankMin', 'opponentRankMax');

  if (!state.player && !state.country) {
    state.opponentRankMin = undefined;
    state.opponentRankMax = undefined;
  }

  return groupingForState(
    state,
    getGameGroupEligibility(state, countriesEnabled, categoriesEnabled && Boolean(categories.size))
  );
}

export function filterGameRecords(games: readonly ApiGameInfo[], state: GameBrowserState): GameMatch[] {
  const matches: GameMatch[] = [];

  for (const game of games) {
    if (!matchesGlobalFilters(game, state)) {
      continue;
    }

    const orientation = getOrientations(game).find((candidate) => matchesOrientation(candidate, state));

    if (orientation) {
      matches.push(orientation);
    }
  }

  return matches;
}

export function sortGameRecords(matches: readonly GameMatch[], sort: GameSort): GameMatch[] {
  return matches.toSorted(
    (left, right) => comparePrimary(left.game, right.game, sort) || compareStable(left.game, right.game, sort)
  );
}

export function getGameResultType(result?: string): GameResultType {
  const normalized = result?.trim().toUpperCase() ?? '';

  if (/^[BW]\+R$/.test(normalized)) {
    return 'resignation';
  }

  if (/^[BW]\+T$/.test(normalized)) {
    return 'time';
  }

  if (/^[BW]\+\d+(?:[.,]\d+)?(?:PTS)?$/.test(normalized)) {
    return 'points';
  }

  return 'other';
}

export function getRankLevel(rank?: string) {
  const match = rank
    ?.trim()
    .toLowerCase()
    .match(/^(\d+)([kdp])$/);

  if (!match) {
    return undefined;
  }

  const value = Number(match[1]);

  if (value < 1) {
    return undefined;
  }

  switch (match[2]) {
    case 'k':
      return 100 - value;
    case 'd':
      return 99 + value;
    case 'p':
      return 108 + value;
  }
}

export function getGameGroupEligibility(state: GameBrowserState, countriesEnabled = true, categoriesEnabled = false) {
  return {
    opponentPlayer: Boolean((state.player || state.country) && !state.opponent),
    opponentCountry: Boolean(
      countriesEnabled && (state.player || state.country) && !state.opponent && !state.opponentCountry
    ),
    countryPlayer: Boolean(countriesEnabled && state.country && !state.player),
    category: categoriesEnabled,
  };
}

export function getGameBrowserDomains(games: readonly ApiGameInfo[]): GameBrowserDomains {
  const ranks = new Set<string>();
  const years = games.map((game) => game.tournament);
  const moves = games.map((game) => game.moves);

  for (const game of games) {
    for (const rank of [game.black.rank, game.white.rank]) {
      const normalized = normalizeRank(rank);
      if (normalized) {
        ranks.add(normalized);
      }
    }
  }

  return {
    ranks: [...ranks].toSorted((a, b) => getRankLevel(a)! - getRankLevel(b)!),
    years: [...new Set(years)].toSorted((a, b) => b - a),
    movesMin: moves.length ? Math.min(...moves) : undefined,
    movesMax: moves.length ? Math.max(...moves) : undefined,
  };
}

function buildPlayerFacet(
  games: readonly ApiGameInfo[],
  state: GameBrowserState,
  facet: 'player' | 'opponent',
  meta: Map<string, PlayerMeta>,
  visible: boolean
): GameFacet {
  const counts = countFacet(games, state, facet);
  const selected = state[facet];
  const values = new Set(counts.keys());

  if (selected && meta.has(selected)) {
    values.add(selected);
  }

  const options = [...values]
    .map((value) => {
      const details = meta.get(value);
      return {
        value,
        label: details?.label ?? value,
        count: counts.get(value) ?? 0,
        search: details ? [...details.aliases].join(' ') : value,
      };
    })
    .toSorted((a, b) => b.count - a.count || a.label.localeCompare(b.label) || a.value.localeCompare(b.value));

  return { visible, options };
}

function buildCountryFacet(
  games: readonly ApiGameInfo[],
  state: GameBrowserState,
  facet: 'country' | 'opponentCountry',
  countryLabel: (country: string) => string,
  countriesEnabled: boolean,
  visible: boolean
): GameFacet {
  if (!countriesEnabled) {
    return { visible: false, options: [] };
  }

  const counts = countFacet(games, state, facet);
  const selected = state[facet];
  const values = new Set(counts.keys());

  if (selected) {
    values.add(selected);
  }

  return {
    visible,
    options: [...values]
      .map((value) => ({
        value,
        label: countryLabel(value),
        count: counts.get(value) ?? 0,
        search: value,
      }))
      .toSorted((a, b) => a.label.localeCompare(b.label) || a.value.localeCompare(b.value)),
  };
}

function buildCategoryFacet(
  games: readonly ApiGameInfo[],
  state: GameBrowserState,
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
      .map((category) => ({
        value: category,
        label: categoryLabel(category),
        count: counts.get(category) ?? 0,
      }))
      .toSorted((left, right) => left.label.localeCompare(right.label) || left.value.localeCompare(right.value)),
  };
}

function buildYearFacet(games: readonly ApiGameInfo[], state: GameBrowserState): GameFacet {
  const counts = new Map<number, number>();

  for (const match of filterGameRecords(games, { ...state, years: [] })) {
    const year = match.game.tournament;
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  const values = new Set([...counts.keys(), ...state.years]);

  return {
    visible: true,
    options: [...values]
      .map((year) => ({ value: String(year), label: String(year), count: counts.get(year) ?? 0 }))
      .toSorted((left, right) => Number(right.value) - Number(left.value)),
  };
}

function buildMediaFacetCounts(games: readonly ApiGameInfo[], state: GameBrowserState) {
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

function buildResultFacetCounts(games: readonly ApiGameInfo[], state: GameBrowserState) {
  return Object.fromEntries(
    GAME_RESULT_TYPES.map((result) => [
      result,
      filterGameRecords(games, {
        ...state,
        results: [result],
      }).length,
    ])
  ) as Record<GameResultType, number>;
}

function buildKomiFacet(games: readonly ApiGameInfo[], state: GameBrowserState): GameFacet {
  const counts = new Map<string, number>();

  for (const match of filterGameRecords(games, { ...state, komi: [] })) {
    if (match.game.komi === undefined) {
      continue;
    }

    const komi = formatKomi(match.game.komi);
    counts.set(komi, (counts.get(komi) ?? 0) + 1);
  }

  const values = new Set([...counts.keys(), ...state.komi]);

  return {
    visible: values.size > 1,
    options: [...values]
      .map((komi) => ({ value: komi, label: komi, count: counts.get(komi) ?? 0 }))
      .toSorted((left, right) => compareKomi(left.value, right.value)),
  };
}

function buildWinnerFacetCounts(games: readonly ApiGameInfo[], state: GameBrowserState) {
  return Object.fromEntries(
    GAME_WINNERS.map((winner) => [winner, filterGameRecords(games, { ...state, winner }).length])
  ) as Record<GameWinner, number>;
}

function buildColorFacetCounts(
  games: readonly ApiGameInfo[],
  state: GameBrowserState,
  facet: 'playerColor'
) {
  return Object.fromEntries(
    PLAYER_COLORS.map((color) => [color, filterGameRecords(games, { ...state, [facet]: color }).length])
  ) as Record<PlayerColor, number>;
}

function countFacet(games: readonly ApiGameInfo[], state: GameBrowserState, facet: FacetKey) {
  const counts = new Map<string, number>();

  for (const game of games) {
    if (!matchesGlobalFilters(game, state)) {
      continue;
    }

    const values = new Set<string>();

    for (const orientation of getOrientations(game)) {
      if (!matchesOrientation(orientation, state, facet)) {
        continue;
      }

      const value = getFacetValue(orientation, facet);
      if (value) {
        values.add(value);
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

function matchesGlobalFilters(game: ApiGameInfo, state: GameBrowserState) {
  if (state.category && game.category !== state.category) {
    return false;
  }
  if (state.years.length && !state.years.includes(game.tournament)) {
    return false;
  }
  if (state.movesMin !== undefined && game.moves < state.movesMin) {
    return false;
  }
  if (state.movesMax !== undefined && game.moves > state.movesMax) {
    return false;
  }
  if (state.results.length && !state.results.includes(getGameResultType(game.result))) {
    return false;
  }
  if (state.komi.length && (game.komi === undefined || !state.komi.includes(formatKomi(game.komi)))) {
    return false;
  }
  if ((state.winner === 'black' || state.winner === 'white') && game.winner !== state.winner) {
    return false;
  }
  if (state.media.includes('ogs') && !game.ogs) {
    return false;
  }
  if (state.media.includes('ai') && !game.ai) {
    return false;
  }
  if (state.media.includes('yt') && (!game.yt || !game.yt.length)) {
    return false;
  }
  return true;
}

function matchesOrientation(orientation: OrientedGame, state: GameBrowserState, ignoredFacet?: FacetKey) {
  if (ignoredFacet !== 'player' && state.player && orientation.player.id !== state.player) {
    return false;
  }
  if (
    ignoredFacet !== 'country' &&
    state.country &&
    orientation.player.country?.toUpperCase() !== state.country.toUpperCase()
  ) {
    return false;
  }
  if (ignoredFacet !== 'opponent' && state.opponent && orientation.opponent.id !== state.opponent) {
    return false;
  }
  if (
    ignoredFacet !== 'opponentCountry' &&
    state.opponentCountry &&
    orientation.opponent.country?.toUpperCase() !== state.opponentCountry.toUpperCase()
  ) {
    return false;
  }
  if (ignoredFacet !== 'playerColor' && state.playerColor && orientation.playerColor !== state.playerColor) {
    return false;
  }
  if (state.winner === 'player' && orientation.game.winner !== orientation.playerColor) {
    return false;
  }
  if (
    state.winner === 'opponent' &&
    orientation.game.winner !== (orientation.playerColor === 'black' ? 'white' : 'black')
  ) {
    return false;
  }
  if (!matchesRank(orientation.player.rank, state.playerRankMin, state.playerRankMax)) {
    return false;
  }
  if (!matchesRank(orientation.opponent.rank, state.opponentRankMin, state.opponentRankMax)) {
    return false;
  }
  return true;
}

function matchesRank(rank: string | undefined, minimum?: string, maximum?: string) {
  if (!minimum && !maximum) {
    return true;
  }

  const value = getRankLevel(rank);
  if (value === undefined) {
    return false;
  }
  if (minimum && value < getRankLevel(minimum)!) {
    return false;
  }
  if (maximum && value > getRankLevel(maximum)!) {
    return false;
  }
  return true;
}

function getOrientations(game: ApiGameInfo): [OrientedGame, OrientedGame] {
  return [
    { game, player: game.black, opponent: game.white, playerColor: 'black' },
    { game, player: game.white, opponent: game.black, playerColor: 'white' },
  ];
}

function hasStructuralMatch(games: readonly ApiGameInfo[], filters: Partial<GameBrowserState>) {
  return games.some((game) =>
    getOrientations(game).some((orientation) => {
      if (filters.player && orientation.player.id !== filters.player) {
        return false;
      }
      if (filters.country && orientation.player.country?.toUpperCase() !== filters.country.toUpperCase()) {
        return false;
      }
      if (filters.opponent && orientation.opponent.id !== filters.opponent) {
        return false;
      }
      if (
        filters.opponentCountry &&
        orientation.opponent.country?.toUpperCase() !== filters.opponentCountry.toUpperCase()
      ) {
        return false;
      }
      return true;
    })
  );
}

function groupGameRecords(
  matches: readonly GameMatch[],
  state: GameBrowserState,
  options: {
    playerMeta: Map<string, PlayerMeta>;
    countryLabel: (country: string) => string;
    categoryLabel: (category: string) => string;
    unknownCountryLabel: string;
    locale?: string;
  }
): GameBrowserGroupResult[] {
  if (state.group === 'none') {
    return [{ key: 'all', games: matches.map((match) => match.game) }];
  }

  const groups = new Map<string, { label: string; games: ApiGameInfo[] }>();

  for (const match of matches) {
    const details = getGroupDetails(match, state.group, state, options);
    const group = groups.get(details.key) ?? { label: details.label, games: [] };
    group.games.push(match.game);
    groups.set(details.key, group);
  }

  return [...groups]
    .toSorted(([leftKey, left], [rightKey, right]) =>
      state.group === 'year'
        ? Number(rightKey) - Number(leftKey)
        : left.label.localeCompare(right.label, options.locale)
    )
    .map(([key, group]) => ({ key, label: group.label, games: group.games }));
}

function getGroupDetails(
  match: GameMatch,
  group: Exclude<GameGroup, 'none'>,
  state: GameBrowserState,
  options: {
    playerMeta: Map<string, PlayerMeta>;
    countryLabel: (country: string) => string;
    categoryLabel: (category: string) => string;
    unknownCountryLabel: string;
  }
) {
  switch (group) {
    case 'opponent-player':
      return {
        key: match.opponent.id,
        label: options.playerMeta.get(match.opponent.id)?.label ?? match.opponent.name,
      };
    case 'opponent-country':
      const country = match.opponent.country?.toUpperCase() ?? '__unknown__';
      return {
        key: country,
        label: country === '__unknown__' ? options.unknownCountryLabel : options.countryLabel(country),
      };
    case 'country-player': {
      const selectedCountry = state.country?.toUpperCase();
      const isSameCountryPair =
        selectedCountry &&
        match.player.country?.toUpperCase() === selectedCountry &&
        match.opponent.country?.toUpperCase() === selectedCountry;

      if (isSameCountryPair) {
        const players = [match.player, match.opponent]
          .map((player) => ({
            id: player.id,
            label: options.playerMeta.get(player.id)?.label ?? player.name,
          }))
          .toSorted((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id));

        return {
          key: `pair:${players.map((player) => player.id).join('|')}`,
          label: `${players[0].label} vs ${players[1].label}`,
        };
      }

      return {
        key: `player:${match.player.id}`,
        label: options.playerMeta.get(match.player.id)?.label ?? match.player.name,
      };
    }
    case 'year':
      return { key: String(match.game.tournament), label: String(match.game.tournament) };
    case 'category': {
      const category = match.game.category ?? '__unknown__';
      return {
        key: category,
        label: category === '__unknown__' ? options.unknownCountryLabel : options.categoryLabel(category),
      };
    }
  }
}

function getPlayerMeta(games: readonly ApiGameInfo[]) {
  const result = new Map<string, PlayerMeta>();

  for (const game of games) {
    for (const player of [game.black, game.white]) {
      const current = result.get(player.id);
      const aliases = current?.aliases ?? new Set<string>();
      aliases.add(player.name);
      if (player.original) {
        aliases.add(player.original);
      }
      for (const nickname of player.nickname ?? []) {
        aliases.add(nickname);
      }

      if (!current || game.tournament >= current.latestTournament) {
        result.set(player.id, { label: player.name, aliases, latestTournament: game.tournament });
      } else {
        current.aliases = aliases;
      }
    }
  }

  return result;
}

function getPlayers(games: readonly ApiGameInfo[]) {
  return new Set(games.flatMap((game) => [game.black.id, game.white.id]));
}

function getCountries(games: readonly ApiGameInfo[]) {
  return new Set(
    games
      .flatMap((game) => [game.black.country, game.white.country])
      .filter((country): country is string => Boolean(country))
      .map((country) => country.toUpperCase())
  );
}

function getCategories(games: readonly ApiGameInfo[]) {
  return new Set(games.map((game) => game.category).filter((category): category is string => Boolean(category)));
}

function comparePrimary(left: ApiGameInfo, right: ApiGameInfo, sort: GameSort) {
  switch (sort) {
    case 'year-desc':
      return right.tournament - left.tournament;
    case 'year-asc':
      return left.tournament - right.tournament;
    case 'moves-desc':
      return right.moves - left.moves;
    case 'moves-asc':
      return left.moves - right.moves;
    case 'black-rank-desc':
      return compareOptional(getRankLevel(left.black.rank), getRankLevel(right.black.rank), 'desc');
    case 'black-rank-asc':
      return compareOptional(getRankLevel(left.black.rank), getRankLevel(right.black.rank), 'asc');
    case 'white-rank-desc':
      return compareOptional(getRankLevel(left.white.rank), getRankLevel(right.white.rank), 'desc');
    case 'white-rank-asc':
      return compareOptional(getRankLevel(left.white.rank), getRankLevel(right.white.rank), 'asc');
    case 'rank-gap-asc':
      return compareOptional(getRankGap(left), getRankGap(right), 'asc');
    case 'rank-gap-desc':
      return compareOptional(getRankGap(left), getRankGap(right), 'desc');
  }
}

function compareStable(left: ApiGameInfo, right: ApiGameInfo, sort: GameSort) {
  const year = sort === 'year-asc' ? left.tournament - right.tournament : right.tournament - left.tournament;
  return (
    year ||
    left.stage - right.stage ||
    (left.round ?? 0) - (right.round ?? 0) ||
    (left.index ?? 0) - (right.index ?? 0) ||
    left.sgf.localeCompare(right.sgf)
  );
}

function compareOptional(left: number | undefined, right: number | undefined, order: 'asc' | 'desc') {
  if (left === undefined) {
    return right === undefined ? 0 : 1;
  }
  if (right === undefined) {
    return -1;
  }
  return order === 'asc' ? left - right : right - left;
}

function getRankGap(game: ApiGameInfo) {
  const black = getRankLevel(game.black.rank);
  const white = getRankLevel(game.white.rank);
  return black === undefined || white === undefined ? undefined : Math.abs(black - white);
}

function groupingForState(
  state: GameBrowserState,
  eligibility: ReturnType<typeof getGameGroupEligibility>
): GameBrowserState {
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

function normalizeRange(state: GameBrowserState, minimum: 'movesMin', maximum: 'movesMax') {
  const min = state[minimum] as number | undefined;
  const max = state[maximum] as number | undefined;
  if (min !== undefined && max !== undefined && min > max) {
    (state as Record<string, unknown>)[minimum] = max;
    (state as Record<string, unknown>)[maximum] = min;
  }
}

function normalizeRankRange(
  state: GameBrowserState,
  minimum: 'playerRankMin' | 'opponentRankMin',
  maximum: 'playerRankMax' | 'opponentRankMax'
) {
  const min = state[minimum];
  const max = state[maximum];
  if (min && max && getRankLevel(min)! > getRankLevel(max)!) {
    state[minimum] = max;
    state[maximum] = min;
  }
}

function normalizeRank(rank?: string | null) {
  const value = rank?.trim().toLowerCase();
  return value && getRankLevel(value) !== undefined ? value : undefined;
}

function readString(params: SearchParamsReader, key: string) {
  const value = params.get(key)?.trim();
  return value || undefined;
}

function readNumber(params: SearchParamsReader, key: string) {
  const value = readString(params, key);
  if (value === undefined) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
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

function isKnown<T extends string>(value: string | null | undefined, values: readonly T[]): value is T {
  return Boolean(value && (values as readonly string[]).includes(value));
}

function uniqueKnown<T extends string>(values: readonly string[], known: readonly T[]): T[] {
  return known.filter((value) => values.includes(value));
}

function uniqueKomi(values: readonly string[]) {
  return [...new Set(values.map((value) => Number(value)).filter(Number.isFinite).map(formatKomi))];
}

function formatKomi(komi: number) {
  return Number.isInteger(komi) ? String(komi) : String(komi).replace(/\.0+$/, '');
}

function compareKomi(left: string, right: string) {
  return Number(left) - Number(right);
}

function uniqueNumbers(values: readonly string[]) {
  return [...new Set(values.map(Number).filter((value) => Number.isInteger(value) && value >= 0))];
}
