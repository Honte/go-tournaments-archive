import { buildLocalGameId } from '@/libs/h9';
import { GAME_REGEX } from '@/data/games';
import { formatSgfWinner, resolveSgfPlaces } from './match';
import { parseFilename } from './sgf';
import { type ParsedGameEntry, type SgfInfo, UNKNOWN_PLACE } from './types';

const SGF_REGEX = /\bsgf:(\S+)/;
const ROUND_REGEX = /\bround:(\d+)/;

export function buildUnmatchedString(sgf: SgfInfo, playerLookup: Map<string, number>, props?: string): string {
  const places = resolveSgfPlaces(sgf, playerLookup);
  const { winnerPlace, resultStr } = formatSgfWinner(sgf, places);

  const black = places.blackPlace ?? UNKNOWN_PLACE;
  const white = places.whitePlace ?? UNKNOWN_PLACE;
  const winnerPart = resultStr ? `${winnerPlace}:${resultStr}` : String(winnerPlace);
  const roundPart = sgf.round !== null ? ` round:${sgf.round}` : '';

  return `${black}-${white} ${winnerPart}${roundPart} sgf:${sgf.path} ${props ?? ''}`.trim();
}

export function parseEntry(entry: string): ParsedGameEntry | null {
  const gameMatch = entry.match(GAME_REGEX);

  if (!gameMatch) {
    return null;
  }

  const { home, away, props } = gameMatch.groups!;
  const sgfMatch = props?.match(SGF_REGEX);

  if (isNaN(Number(home)) || isNaN(Number(away)) || !sgfMatch) {
    return null;
  }

  const roundMatch = props?.match(ROUND_REGEX);
  const round = roundMatch ? Number(roundMatch[1]) : parseFilename(sgfMatch[1]).round;

  let remaining = props.replace(sgfMatch[0], '');
  if (roundMatch) {
    remaining = remaining.replace(roundMatch[0], '');
  }

  return {
    id: buildLocalGameId(Number(home), Number(away), round ?? undefined),
    sgf: sgfMatch[1],
    round,
    props: remaining.replace(/\s+/g, ' ').trim(),
  };
}

export function compareEntries(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
