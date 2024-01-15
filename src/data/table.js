import { getRankValue } from '@/data/rank';

export function createTable(stage, playersMap) {
  const players = {};

  let position = 1;
  for (const player in playersMap) {
    players[player] = {
      id: player,
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      startingPosition: position++,
      games: new Array(stage.rounds.length),
      won: [],
      lost: [],
      rank: getRankValue(playersMap[player].rank)
    };
  }

  // collect wins & games
  for (const [index, round] of stage.rounds.entries()) {
    for (const game of round) {
      const [a, b] = game.players;

      const winner = a.won ? a.id : b.id;
      const loser = a.won ? b.id : a.id;

      players[winner].wins += 1;
      players[winner].won.push(loser);
      players[loser].lost.push(winner);
      players[winner].games[index] = {
        opponent: loser,
        won: true,
        game
      };
      players[loser].games[index] = {
        opponent: winner,
        won: false,
        game
      };;
    }
  }

  // calculate sos & sodos
  for (const id in players) {
    const player = players[id];

    for (const won of player.won) {
      player.sos += players[won].wins
      player.sodos += players[won].wins
    }

    for (const lost of player.lost) {
      player.sos += players[lost].wins
    }
  }

  // calculate sosos
  for (const id in players) {
    const player = players[id];

    for (const won of player.won) {
      player.sosos += players[won].sos
    }

    for (const lost of player.lost) {
      player.sosos += players[lost].sos
    }
  }

  const comparator = createComparator(stage.breakers)
  const table = Object.values(players).sort(comparator)

  return table;
}

function createComparator(breakers) {
  return function compareBreakers(a, b) {
    for (const breaker of breakers) {
      const result = compare(a, b, breaker);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  }
}

function compare(a, b, breaker) {
  if (breaker === 'direction') {
    if (a.won.includes(b)) {
      return -1;
    }

    return b.won.includes(a) ? 1 : 0
  }

  return b[breaker] - a[breaker];
}
