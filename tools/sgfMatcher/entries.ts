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

export function buildEntryWithoutSgf(rawEntry: string): string {
  return rawEntry.replace(SGF_REGEX, '').replace(/\s+/g, ' ').trim();
}

export function buildSgfEntryString({ black, white, winner, result, round, sgf, props }: SgfMatchResult): string {
  const winnerPart = result ? `${winner}:${result}` : String(winner);
  const roundPart = round !== null ? ` round:${round}` : '';

  return `${black}-${white} ${winnerPart}${roundPart} sgf:${sgf} ${props ?? ''}`.trim();
}
