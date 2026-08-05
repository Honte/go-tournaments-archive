import type { ApiGameInfo } from '@/schema/api';
import { getRankValue } from '@/libs/rank';
import type { OrientedGame } from './filters';
import type { GameSort } from './schema';

export function sortGameRecords(matches: readonly OrientedGame[], sort: GameSort): OrientedGame[] {
  return matches.toSorted(
    (left, right) => comparePrimary(left.game, right.game, sort) || compareStable(left.game, right.game, sort)
  );
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
      return compareOptional(getRankValue(left.black.rank), getRankValue(right.black.rank), 'desc');
    case 'black-rank-asc':
      return compareOptional(getRankValue(left.black.rank), getRankValue(right.black.rank), 'asc');
    case 'white-rank-desc':
      return compareOptional(getRankValue(left.white.rank), getRankValue(right.white.rank), 'desc');
    case 'white-rank-asc':
      return compareOptional(getRankValue(left.white.rank), getRankValue(right.white.rank), 'asc');
    case 'rank-gap-asc':
      return compareOptional(getRankGap(left), getRankGap(right), 'asc');
    case 'rank-gap-desc':
      return compareOptional(getRankGap(left), getRankGap(right), 'desc');
  }
}

function compareStable(left: ApiGameInfo, right: ApiGameInfo, sort: GameSort) {
  return (
    (sort === 'year-asc' ? left.tournament - right.tournament : right.tournament - left.tournament) ||
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
  const black = getRankValue(game.black.rank);
  const white = getRankValue(game.white.rank);
  return black === undefined || white === undefined ? undefined : Math.abs(black - white);
}
