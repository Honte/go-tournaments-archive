export const JIGO = 'jigo';

export function isDrawResult(result?: string | null): boolean {
  const normalized = result?.trim().toLowerCase();

  return normalized === '0' || normalized === 'draw' || normalized === 'jigo' || normalized === '=';
}

export function getGameStats(games: { won: boolean; drawn?: boolean; unresolved?: boolean }[]) {
  let won = 0;
  let drawn = 0;
  let unresolved = 0;

  for (const game of games) {
    if (game.won) {
      won++;
    } else if (game.drawn) {
      drawn++;
    } else if (game.unresolved) {
      unresolved++;
    }
  }

  const total = games.length - unresolved;

  return {
    games: total,
    won,
    drawn,
    unresolved,
    lost: total - won - drawn,
    wonPercent: won / total,
  };
}
