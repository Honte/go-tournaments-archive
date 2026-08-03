import { stringifyProps } from '@tools/sgfMatcher/utils';

export type SgfMatchResult = {
  home: string | number;
  away: string | number;
  black?: string | number;
  winner: string | number | null;
  result: string | null;
  sgf: string;
  props?: Record<string, string | undefined | null>;
};

const SGF_REGEX = /\bsgf:(\S+)/;

export function buildEntryWithoutSgf(rawEntry: string): string {
  return rawEntry.replace(SGF_REGEX, '').replace(/\s+/g, ' ').trim();
}

export function buildSgfEntryString({ home, away, black, winner, result, sgf, props }: SgfMatchResult): string {
  const winnerPart = winner === null ? 'jigo' : result ? `${winner}:${result}` : String(winner);
  const { round, ...restProps } = props ?? {};
  const colorPart = winner === null && black ? ` black:${black}` : '';
  const roundPart = round ? ` round:${round}` : '';

  return `${home}-${away} ${winnerPart}${colorPart}${roundPart} sgf:${sgf}${stringifyProps(restProps)}`;
}
