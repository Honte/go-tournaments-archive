import EVENT_CONFIG from '@event/config';
import type {
  Game,
  Player,
  Stats,
  StatsCategory,
  StatsCategoryPlayer,
  StatsCountry,
  StatsCountryResult,
  StatsMedals,
  StatsPlayer,
  StatsPlayerGame,
  StatsPlayerResult,
  Tournament,
} from '@/schema/data';

export function calculateStats(tournaments: Tournament[]): Stats {
  const players: Record<string, StatsPlayer> = {};
  const countries: Record<string, StatsCountry> = {};
  const categories: Record<string, StatsCategory> = {};
  const games: Record<string, Game> = {};

  if (EVENT_CONFIG.categories?.length) {
    for (const category of EVENT_CONFIG.categories) {
      categories[category] = {
        tournaments: [],
        category,
      };
    }
  }

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
    const { year, players: tournamentPlayers, stages, top, games: tournamentGames, categoriesTop } = tournament;
    const tournamentCategories: Record<string, StatsCategoryPlayer[]> = {};
    const tournamentPlayersMap: Record<string, StatsPlayer> = {
      BYE: players.BYE,
    };
    for (const pid in tournamentPlayers) {
      const player = upsertPlayer(tournamentPlayers[pid]);
      const country = tournamentPlayers[pid].country;

      tournamentPlayersMap[pid] = player;
      player.years.push(year);

      if (country && !player.countries.includes(country)) {
        player.countries.push(country);
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
              id: tournamentPlayersMap[game.opponent].id,
              country: tournamentPlayers[game.opponent]?.country,
              rank: tournamentPlayers[game.opponent]?.rank,
              won: game.won,
              result: game.result,
              props: tournament.games[game.game]?.props,
              color: game.color,
            });
          }
        }

        const country = tournamentPlayers[player.id].country;
        const rank = tournamentPlayers[player.id]?.rank ?? '';
        const globalPlayer = tournamentPlayersMap[player.id];
        const result: StatsPlayerResult = {
          year,
          stage: stage.type,
          place: player.place,
          finalPlace: player.place > (stage.promoted ?? 0) ? player.place + (stage.placeOffset ?? 0) : Infinity,
          games: playerGames,
          won,
          rank,
          country,
        };

        globalPlayer.results.push(result);

        if (country) {
          upsertCountryYear(country, year).results.push({
            ...result,
            id: globalPlayer.id,
            name: globalPlayer.name,
          });
        }

        if (EVENT_CONFIG.categories?.length) {
          for (const category of EVENT_CONFIG.categories) {
            if ('categories' in player && player?.categories?.[category]) {
              (tournamentCategories[category] ||= []).push({
                id: globalPlayer.id,
                name: globalPlayer.name,
                rank,
                country,
                place: player.categories[category],
              });
            }
          }
        }
      }
    }

    if (EVENT_CONFIG.categories?.length) {
      for (const category of EVENT_CONFIG.categories) {
        upsertMedals(year, tournamentPlayers, categoriesTop?.[category], category);
      }

      for (const category in tournamentCategories) {
        categories[category].tournaments.push({
          year,
          results: tournamentCategories[category],
        });
      }
    } else {
      upsertMedals(year, tournamentPlayers, top);
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

    for (const result of player.results) {
      player.totalGames += result.games.length;
      player.totalWon += result.won;
      player.bestPlace = Math.min(player.bestPlace, result.finalPlace);
    }
  }

  for (const country in countries) {
    const stats = countries[country];
    const [gold, silver, bronze] = stats.medals;

    stats.score = gold.length * 10_000 + silver.length * 100 + bronze.length;

    for (const year in stats.years) {
      const yearStats = stats.years[year];

      for (const result of yearStats.results) {
        yearStats.totalGames += result.games.length;
        yearStats.totalWon += result.won;
        yearStats.bestPlace = Math.min(yearStats.bestPlace, result.finalPlace);
      }

      stats.totalWon += yearStats.totalWon;
      stats.totalGames += yearStats.totalGames;
      stats.bestPlace = Math.min(stats.bestPlace, yearStats.bestPlace);
    }
  }

  return {
    summary: {
      tournaments: tournaments.length,
      players: Object.keys(players).length,
      playedGames,
      sgfs,
      resign,
      timeout,
      relays,
      streams,
      analysis,
      black: black / (black + white),
    },
    games,
    players,
    countries,
    categories,
  };

  function upsertPlayer(player: Player | string): StatsPlayer {
    const id = typeof player === 'string' ? player : player.id;

    return (players[id] ||= {
      id,
      medals: [[], [], []],
      categoriesMedals: (EVENT_CONFIG.categories || []).reduce<Record<string, StatsMedals>>((acc, category) => {
        acc[category] = [[], [], []];

        return acc;
      }, {}),
      countries: [],
      name: typeof player === 'string' ? id : player.name,
      years: [],
      results: [],
      score: 0,
      bestPlace: Infinity,
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
      bestPlace: Infinity,
      score: 0,
      years: {},
    });
  }

  function upsertCountryYear(country: string, year: number): StatsCountryResult {
    const stats = upsertCountry(country);

    return (stats.years[year] ||= {
      year,
      bestPlace: Infinity,
      totalGames: 0,
      totalWon: 0,
      results: [],
    });
  }

  function upsertMedals(year: number, players: Record<string, Player>, winners?: string[], category?: string) {
    if (!winners) {
      return;
    }

    const edition = String(year);

    for (const [index, winner] of winners.entries()) {
      for (const id of winner.split(',')) {
        const player = players[id];
        const playerStats = upsertPlayer(player);

        playerStats.medals[index].push(edition);

        if (category) {
          playerStats.categoriesMedals[category][index].push(edition);
        }

        if (player.country) {
          upsertCountry(player.country).medals[index].push(edition);
        }
      }
    }
  }
}
