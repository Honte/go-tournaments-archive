import type { ApiGameInfo } from '@/schema/api';
import type { Player } from '@/schema/data';
import { isDrawResult } from '@/libs/games';
import { getRankValue } from '@/libs/rank';
import { type GameRecordsState, type GameResultType, type PlayerColor } from './schema';

export type OrientedGame = { game: ApiGameInfo; player: Player; opponent: Player; playerColor: PlayerColor };
export type FacetKey = 'player' | 'country' | 'opponent' | 'opponentCountry' | 'playerColor';
export const UNKNOWN_KOMI = 'unknown';

export function filterGameRecords(games: readonly ApiGameInfo[], state: GameRecordsState): OrientedGame[] {
  const matches: OrientedGame[] = [];

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

export function getGameResultType(result?: string): GameResultType {
  const value = result?.trim().toUpperCase() ?? '';
  if (/^[BW]\+\?$/.test(value)) {
    return 'unknown';
  }
  if (/^[BW]\+R$/.test(value)) {
    return 'resignation';
  }
  if (/^[BW]\+T$/.test(value)) {
    return 'time';
  }
  if (/^[BW]\+\d+(?:[.,]\d+)?(?:PTS)?$/.test(value)) {
    return 'points';
  }
  return 'other';
}

export function getOrientations(game: ApiGameInfo): [OrientedGame, OrientedGame] {
  return [
    { game, player: game.black, opponent: game.white, playerColor: 'black' },
    { game, player: game.white, opponent: game.black, playerColor: 'white' },
  ];
}

export function matchesGlobalFilters(game: ApiGameInfo, state: GameRecordsState) {
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

  if (state.komi.length && !state.komi.includes(formatKomi(game.komi))) {
    return false;
  }

  if ((state.winner === 'black' || state.winner === 'white') && game.winner !== state.winner) {
    return false;
  }

  if (state.winner === 'jigo' && !isDrawResult(game.result)) {
    return false;
  }

  if (state.media.includes('ogs') && !game.ogs) {
    return false;
  }

  if (state.media.includes('ai') && !game.ai) {
    return false;
  }

  return !(state.media.includes('yt') && (!game.yt || !game.yt.length));
}

export function matchesOrientation(orientation: OrientedGame, state: GameRecordsState, ignoredFacet?: FacetKey) {
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

  if (
    (state.winner === 'player' || state.winner === 'country') &&
    orientation.game.winner !== orientation.playerColor
  ) {
    return false;
  }

  if (
    (state.winner === 'player-opponent' || state.winner === 'country-opponent') &&
    orientation.game.winner === orientation.playerColor
  ) {
    return false;
  }

  return (
    matchesRank(orientation.player.rank, state.playerRankMin, state.playerRankMax) &&
    matchesRank(orientation.opponent.rank, state.opponentRankMin, state.opponentRankMax)
  );
}

export function formatKomi(komi: number | null | undefined) {
  if (komi === null || komi === undefined || !Number.isFinite(komi)) {
    return UNKNOWN_KOMI;
  }

  return Number.isInteger(komi) ? String(komi) : String(komi).replace(/\.0+$/, '');
}

export function compareKomi(left: string, right: string) {
  if (left === UNKNOWN_KOMI) {
    return right === UNKNOWN_KOMI ? 0 : -1;
  }
  if (right === UNKNOWN_KOMI) {
    return 1;
  }

  return Number(left) - Number(right);
}

export function uniqueKnown<T extends string>(values: readonly string[], known: readonly T[]): T[] {
  return known.filter((value) => values.includes(value));
}

export function isKnown<T extends string>(value: string | null | undefined, values: readonly T[]): value is T {
  return Boolean(value && (values as readonly string[]).includes(value));
}

export function uniqueKomi(values: readonly string[]) {
  return [
    ...new Set(
      values
        .map((value) => {
          const normalized = value.trim().toLowerCase();
          return normalized === UNKNOWN_KOMI || normalized === 'null' ? UNKNOWN_KOMI : Number(value);
        })
        .filter((value): value is number | typeof UNKNOWN_KOMI => value === UNKNOWN_KOMI || Number.isFinite(value))
        .map((value) => (value === UNKNOWN_KOMI ? value : formatKomi(value)))
    ),
  ];
}

function matchesRank(rank: string | undefined, minimum?: string, maximum?: string) {
  if (!minimum && !maximum) {
    return true;
  }
  const value = getRankValue(rank);
  return (
    value !== undefined &&
    (!minimum || value >= getRankValue(minimum)!) &&
    (!maximum || value <= getRankValue(maximum)!)
  );
}
