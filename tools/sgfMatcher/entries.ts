import { GAME_REGEX } from '@/data/games';
import { formatSgfWinner, resolveSgfPlaces } from './match';
import { type ParsedGameEntry, type SgfInfo, UNKNOWN_PLACE } from './types';
import { normalizeLocalGameId } from './utils';

const SGF_REGEX = /\bsgf:(\S+)/;

export function buildUnmatchedString(sgf: SgfInfo, playerLookup: Map<string, number>, props?: string): string {
  const places = resolveSgfPlaces(sgf, playerLookup);
  const { winnerPlace, resultStr } = formatSgfWinner(sgf, places);

  const black = places.blackPlace ?? UNKNOWN_PLACE;
  const white = places.whitePlace ?? UNKNOWN_PLACE;
  const winnerPart = resultStr ? `${winnerPlace}:${resultStr}` : String(winnerPlace);

  return `${black}-${white} ${winnerPart} sgf:${sgf.path} ${props ?? ''}`.trim();
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

  return {
    id: normalizeLocalGameId(`${home}-${away}`),
    sgf: sgfMatch[1],
    props: props.replace(sgfMatch[0], '').trim(),
  };
}

export function compareEntries(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
