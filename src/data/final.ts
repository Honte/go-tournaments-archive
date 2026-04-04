import type { FinalStage, Game, GamePlayer, TablePlayerGame } from '@/schema/data';

export type FinalPlayerEntry = {
  id: string;
  place: number;
  games: TablePlayerGame[];
  wins: number;
  prevScore?: number;
};

export function createFinalTable(stage: FinalStage, games: Record<string, Game>) {
  const players: Record<string, FinalPlayerEntry> = {};

  for (const id of stage.games) {
    const [a, b] = games[id].players;

    addGame(a, b.id, id);
    addGame(b, a.id, id);
  }

  const [home, away] = Object.keys(players);

  if (stage.includePrevious) {
    for (const game of iterateGames(games, home, away)) {
      if (!stage.games.includes(game.id)) {
        const [a, b] = game.players;

        addGame(a, b.id, game.id);
        addGame(b, a.id, game.id);

        players[a.id].prevScore = Number(a.won);
        players[b.id].prevScore = Number(b.won);
        break;
      }
    }
  }

  const result = players[home].wins > players[away].wins ? [home, away] : [away, home];

  return result.map((p, index) => ({
    ...players[p],
    place: index + 1,
  }));

  function addGame(player: GamePlayer, opponent: string, game: string) {
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
      result: '',
      game,
    });
  }
}

function* iterateGames(games: Record<string, Game>, playerA: string, playerB: string): IterableIterator<Game> {
  for (const id in games) {
    const game = games[id];
    const [a, b] = game.players;

    if ((a.id === playerA && b.id === playerB) || (a.id === playerB && b.id === playerA)) {
      yield game;
    }
  }
}