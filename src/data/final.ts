import type { Game, GamePlayer, TablePlayerGame } from '@/schema/data';

export type FinalPlayerEntry = {
  id: string;
  place: number;
  games: TablePlayerGame[];
  wins: number;
  prevScore?: number;
};

export function createFinalTable({
  games,
  gamesMap,
  includePrevious,
}: {
  games: string[];
  gamesMap: Record<string, Game>;
  includePrevious: boolean;
}) {
  const players: Record<string, FinalPlayerEntry> = {};

  for (const id of games) {
    const {
      draw,
      players: [a, b],
    } = gamesMap[id];

    addGame(a, b.id, id, draw);
    addGame(b, a.id, id, draw);
  }

  const [home, away] = Object.keys(players);

  if (includePrevious) {
    for (const game of iterateGames(gamesMap, home, away)) {
      if (!games.includes(game.id)) {
        const [a, b] = game.players;

        addGame(a, b.id, game.id, game.draw);
        addGame(b, a.id, game.id, game.draw);

        players[a.id].prevScore = Number(a.won);
        players[b.id].prevScore = Number(b.won);
        break;
      }
    }
  }

  const result = players[home].wins >= players[away].wins ? [home, away] : [away, home];

  return result.map((p, index) => ({
    ...players[p],
    place: index + 1,
  }));

  function addGame(player: GamePlayer, opponent: string, game: string, drawn: boolean) {
    players[player.id] ||= {
      id: player.id,
      place: 0,
      games: [],
      wins: 0,
    };

    players[player.id].wins += Number(player.won);
    players[player.id].games.push({
      opponent,
      won: player.won,
      drawn,
      result: '',
      game,
    });
  }
}

function* iterateGames(gamesMap: Record<string, Game>, playerA: string, playerB: string): IterableIterator<Game> {
  for (const id in gamesMap) {
    const game = gamesMap[id];
    const [a, b] = game.players;

    if ((a.id === playerA && b.id === playerB) || (a.id === playerB && b.id === playerA)) {
      yield game;
    }
  }
}
