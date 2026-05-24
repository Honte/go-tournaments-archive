export type SgfMatchResult = {
  black: string | number;
  white: string | number;
  winner: string | number;
  result: string | null;
  round: number | null;
  sgf: string;
  props?: string;
};

const SGF_REGEX = /\bsgf:(\S+)/;

export function buildExplicitMatchedString(rawEntry: string, sgfPath: string): string {
  const sgfProp = `sgf:${sgfPath}`;

  if (SGF_REGEX.test(rawEntry)) {
    return rawEntry.replace(SGF_REGEX, sgfProp);
  }

  return `${rawEntry} ${sgfProp}`;
}

export function buildExplicitEntryWithoutSgf(rawEntry: string): string {
  return rawEntry.replace(SGF_REGEX, '').replace(/\s+/g, ' ').trim();
}

export function buildSgfEntryString({ black, white, winner, result, round, sgf, props }: SgfMatchResult): string {
  const winnerPart = result ? `${winner}:${result}` : String(winner);
  const roundPart = round !== null ? ` round:${round}` : '';

  return `${black}-${white} ${winnerPart}${roundPart} sgf:${sgf} ${props ?? ''}`.trim();
}
