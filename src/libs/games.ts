export const JIGO = 'jigo';

export function isDrawResult(result?: string | null): boolean {
  const normalized = result?.trim().toLowerCase();

  return normalized === '0' || normalized === 'draw' || normalized === 'jigo' || normalized === '=';
}

export function getGameStats(games: { won: boolean; drawn: boolean }[]) {
  const won = games.reduce((total, game) => total + Number(game.won), 0);
  const drawn = games.reduce((total, game) => total + Number(game.drawn), 0);
  const total = games.length;

  return {
    games: total,
    won,
    drawn,
    lost: total - won - drawn,
    wonPercent: won / total,
  };
}
