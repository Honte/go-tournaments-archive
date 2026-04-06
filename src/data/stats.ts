import type {
  Game,
  Player,
  Stats,
  StatsCountry,
  StatsCountryResult,
  StatsPlayer,
  StatsPlayerGame,
  StatsPlayerResult,
  Tournament,
} from '@/schema/data';

export function calculateStats(tournaments: Tournament[]): Stats {
  const players: Record<string, StatsPlayer> = {};
  const countries: Record<string, StatsCountry> = {};
  const games: Record<string, Game> = {};

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

    const tournamentPlayersMap: Record<string, StatsPlayer> = {
      BYE: players.BYE,
    };
    for (const pid in tournamentPlayers) {
      const player = upsertPlayer(tournamentPlayers[pid]);
      const country = tournamentPlayers[pid].country;

      tournamentPlayersMap[pid] = player;
      player.years.push(year);

      if (country) {
        player.countries.add(country);
      }
    }

    for (const stage of stages) {
      for (const player of stage.table) {
        const playerGames: StatsPlayerGame[] = [];
        let won = 0;

        for (const game of player.games) {
          if (game) {
            won += Number(game.won);
            playerGames.push({
              opponent: tournamentPlayersMap[game.opponent].id,
              won: game.won,
              result: game.result,
              game: game.game,
              index: 'index' in game ? game.index : undefined,
            });
          }
        }

        const country = tournamentPlayers[player.id].country;
        const result: StatsPlayerResult = {
          year,
          stage: stage.type,
          place: player.place,
          games: playerGames,
          won,
          rank: tournamentPlayers[player.id]?.rank ?? '',
          country,
        };

        tournamentPlayersMap[player.id].results.push(result);

        if (country) {
          upsertCountryYear(country, year).results.push(result);
        }
      }
    }

    for (const [index, winner] of top.entries()) {
      for (const id of winner.split(',')) {
        tournamentPlayersMap[id].medals[index].push(year.toString());

        const country = tournamentPlayers[id].country;

        if (country) {
          upsertCountry(country).medals[index].push(year.toString());
        }
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

  for (const country in countries) {
    const stats = countries[country];
    const [gold, silver, bronze] = stats.medals;

    stats.score = gold.length * 10_000 + silver.length * 100 + bronze.length;

    for (const year in stats.years) {
      const yearStats = stats.years[year];

      yearStats.totalGames = yearStats.results.reduce((total, r) => total + r.games.length, 0);
      yearStats.totalWon = yearStats.results.reduce((total, r) => total + r.won, 0);
      yearStats.bestPlace = yearStats.results.reduce((best, r) => Math.min(best, r.place), Infinity);
      stats.totalWon += yearStats.totalWon;
      stats.totalGames += yearStats.totalGames;
      stats.totalPlayers += yearStats.results.length;
    }
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
    countries,
    black: black / (black + white),
    playerMedalists: Object.values(players)
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score),
    countryMedalists: Object.values(countries)
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score),
  };

  function upsertPlayer(player: Player | string): StatsPlayer {
    const id = typeof player === 'string' ? player : player.id;

    return (players[id] ||= {
      id,
      medals: [[], [], []],
      countries: new Set(),
      name: typeof player === 'string' ? undefined : player.name,
      years: [],
      results: [],
      score: 0,
      totalGames: 0,
      totalWon: 0,
    });
  }

  function upsertCountry(country: string): StatsCountry {
    return (countries[country] ||= {
      country,
      medals: [[], [], []],
      totalGames: 0,
      totalWon: 0,
      totalPlayers: 0,
      score: 0,
      years: {},
    });
  }

  function upsertCountryYear(country: string, year: number): StatsCountryResult {
    const stats = upsertCountry(country);

    return (stats.years[year] ||= {
      year,
      bestPlace: 0,
      totalGames: 0,
      totalWon: 0,
      results: [],
    });
  }
}
