export function calculateStats(tournaments) {
  const players = {};
  const games = {};

  let playedGames = 0;
  let black = 0;
  let white = 0;
  let resign = 0;
  let timeout = 0;
  let sgfs = 0;
  let analysis = 0;
  let streams = 0;
  let relays = 0;

  upsertPlayer('BYE');

  for (const tournament of tournaments) {
    const { year, players: tournamentPlayers, stages, top, games: tournamentGames } = tournament;

    const tournamentPlayersMap = {
      BYE: players.BYE,
    };
    for (const pid in tournamentPlayers) {
      const player = upsertPlayer(tournamentPlayers[pid]);

      tournamentPlayersMap[pid] = player;
      player.years.push(year);
    }

    for (const stage of stages) {
      for (const player of stage.table) {
        const playerGames = [];
        let won = 0;

        for (const game of player.games) {
          if (game) {
            won += Number(game.won);
            playerGames.push({
              ...game,
              opponent: tournamentPlayersMap[game.opponent].id,
            });
          }
        }

        tournamentPlayersMap[player.id].results.push({
          year,
          stage: stage.type,
          place: player.place,
          games: playerGames,
          won,
          rank: tournamentPlayers[player.id].rank,
        });
      }
    }

    for (const [index, winner] of top.entries()) {
      for (const id of winner.split(',')) {
        tournamentPlayersMap[id].medals[index].push(year);
      }
    }

    for (const id in tournamentGames) {
      const game = tournamentGames[id];

      games[id] = game;

      if (game.players.some((p) => p.id === 'BYE')) {
        continue;
      }

      playedGames++;

      if (game.result?.startsWith('B')) {
        black++;
      }

      if (game.result?.startsWith('W')) {
        white++;
      }

      if (game.result?.includes('R')) {
        resign++;
      }

      if (game.result?.includes('T')) {
        timeout++;
      }

      if (game.props?.sgf) {
        sgfs++;
      }

      if (game.props?.ogs) {
        relays++;
      }

      if (game.props?.yt) {
        streams++;
      }

      if (game.props?.ai) {
        analysis++;
      }
    }
  }

  for (const id in players) {
    const player = players[id];
    const [gold, silver, bronze] = player.medals;

    player.score = gold.length * 10_000 + silver.length * 100 + bronze.length;
    player.totalGames = player.results.reduce((total, r) => total + r.games.length, 0);
    player.totalWon = player.results.reduce((total, r) => total + r.won, 0);
  }

  return {
    tournaments: tournaments.length,
    playedGames,
    games,
    sgfs,
    resign,
    timeout,
    relays,
    streams,
    analysis,
    players,
    black: black / (black + white),
    winners: Object.values(players)
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score),
  };

  function upsertPlayer(player) {
    const id = player?.id || player;

    return (players[id] ||= {
      id,
      medals: [[], [], []],
      name: player?.name,
      years: [],
      results: [],
    });
  }
}
