import { getRankValue } from '@/data/rank';

export function createTable(stage, playersMap) {
  const players = {};

  let position = 1;
  for (const player in playersMap) {
    players[player] = {
      id: player,
      place: 1,
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      starting: position++,
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
      };
    }
  }

  // calculate sos & sodos
  for (const id in players) {
    const player = players[id];

    for (const won of player.won) {
      player.sos += players[won].wins;
      player.sodos += players[won].wins;
    }

    for (const lost of player.lost) {
      player.sos += players[lost].wins;
    }
  }

  // calculate sosos
  for (const id in players) {
    const player = players[id];

    for (const won of player.won) {
      player.sosos += players[won].sos;
    }

    for (const lost of player.lost) {
      player.sosos += players[lost].sos;
    }
  }

  const table = sort(Object.values(players), stage.breakers);

  // assign player index
  for (const player of table) {
    for (const game of player.games) {
      if (game?.opponent) {
        game.index = players[game.opponent].index;
      }
    }
  }

  return table;
}

function sort(players, breakers) {
  const final = breakers.reduce((groups, breaker) => {
    const nextGroups = [];
    const picker = (p) => p[breaker];

    for (const group of groups) {
      if (group.length === 1) {
        nextGroups.push(group);
        continue;
      }

      if (breaker === 'direct') {
        for (const next of getDirectMatchesGroups(group)) {
          nextGroups.push(next);
        }
        continue;
      }

      const entries = getGroupedEntries(group, picker);

      if (breaker === 'starting') {
        entries.reverse();
      }

      for (const [, players] of entries) {
        nextGroups.push(players);
      }
    }

    return nextGroups;
  }, [players]);


  const result = [];
  for (const [index, group] of final.entries()) {
    for (const player of group) {
      player.place = index + 1;
      player.index = result.push(player);
    }
  }

  return result;
}

function getGroupedEntries(list, propPicker) {
  const grouped = list.reduce((map, player) => {
    (map[propPicker(player)] ||= []).push(player);

    return map;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => b - a);
}

function* getDirectMatchesGroups(group) {
  if (group.length === 1) {
    yield group;
    return;
  }

  if (group.length === 2) {
    const [a, b] = group;

    if (a.won.includes(b.id)) {
      yield [a];
      yield [b];
      return;
    }

    if (b.won.includes(a.id)) {
      yield [b];
      yield [a];
      return;
    }

    yield group;
    return;
  }

  const directScores = group.reduce((map, player) => {
    map[player.id] = group.reduce((r, p) => r + Number(player.won.includes(p.id)), 0);

    return map;
  }, {});

  const entries = getGroupedEntries(group, (p) => directScores[p.id]);

  if (entries.length === 1) {
    yield group;
    return;
  }

  for (const [, entry] of entries) {
    yield* getDirectMatchesGroups(entry);
  }
}
