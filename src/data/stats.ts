import type {
  CountryResult,
  CountryStats,
  Game,
  Player,
  PlayerGame,
  PlayerResult,
  PlayerStats,
  Stats,
  CategoryStats,
  CategoryPlayer,
  StatsMedals,
  Tournament,
} from '@/schema/data';
import type { EventConfig } from '@/schema/event';
import type { PlayersHandler } from '@/data/players';

export function calculateStats(event: EventConfig, tournaments: Tournament[], playersHandler: PlayersHandler): Stats {
  const players: Record<string, PlayerStats> = {};
  const countries: Record<string, CountryStats> = {};
  const categories: Record<string, CategoryStats> = {};
  const games: Record<string, Game> = {};

  if (event.categories?.length) {
    for (const category of event.categories) {
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

  for (const tournament of tournaments) {
    const { year, players, stages, top, games: tournamentGames, categoriesTop } = tournament;
    const tournamentCategories: Record<string, CategoryPlayer[]> = {};

    for (const stage of stages) {
      if (stage.excluded) {
        continue;
      }

      for (const player of stage.table) {
        const tournamentPlayer = players[player.id];
        const playerStats = upsertPlayer(tournamentPlayer);
        const playerResult = upsertPlayerResult(playerStats, tournamentPlayer, year);
        const playerGames: PlayerGame[] = [];

        if ('games' in player && player.games?.length) {
          for (const game of player.games) {
            if (game && game.opponent) {
              const globalGame = tournamentGames[game.game];
              const opponent = players[game.opponent];

              playerGames.push({
                id: opponent?.id ?? 'BYE',
                country: players[game.opponent]?.country,
                rank: players[game.opponent]?.rank,
                won: game.won,
                result: game.result,
                props: globalGame?.props,
                color: game.color,
              });

              if (globalGame?.props?.sgf) {
                playerStats.totalSgfs++;
              }

              if (opponent?.id) {
                playerStats.opponents[opponent.id] = opponent.name;
              }
            }
          }
        }

        const stageResult = {
          type: stage.type,
          name: stage.name,
          place: player.place,
          games: playerGames,
        };

        playerResult.stages.push(stageResult);

        const finalPlace = player.place > (stage.promoted ?? 0) ? player.place + (stage.placeOffset ?? 0) : Infinity;

        playerResult.place = Math.min(playerResult.place, finalPlace);
        playerStats.bestPlace = Math.min(playerStats.bestPlace, finalPlace);

        upsertPlayerCountry(playerStats, tournamentPlayer.country);

        const name = tournamentPlayer.name;
        const country = tournamentPlayer.country;
        const rank = tournamentPlayer.rank ?? '';

        if (country) {
          upsertCountryPlayerResult(country, year, playerStats, playerResult);
        }

        if (event.categories?.length) {
          for (const category of event.categories) {
            if ('categories' in player && player?.categories?.[category]) {
              (tournamentCategories[category] ||= []).push({
                id: playerStats.id,
                name,
                rank,
                country,
                place: player.categories[category],
              });
            }
          }
        }
      }
    }

    if (event.categories?.length) {
      for (const category of event.categories) {
        upsertMedals(year, players, categoriesTop?.[category], category);
      }

      for (const category in tournamentCategories) {
        categories[category].tournaments.push({
          year,
          results: tournamentCategories[category],
        });
      }
    } else {
      upsertMedals(year, players, top);
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

    player.totalAttended = player.results.length;
    player.score = gold.length * 10_000 + silver.length * 100 + bronze.length;
    player.results.sort((a, b) => a.year - b.year);

    for (const result of player.results) {
      for (const stage of result.stages) {
        player.totalGames += stage.games.length;
        player.totalWon += stage.games.reduce((total, game) => total + Number(game.won), 0);
      }
    }
  }

  for (const country in countries) {
    const stats = countries[country];
    const [gold, silver, bronze] = stats.medals;

    stats.score = gold.length * 10_000 + silver.length * 100 + bronze.length;

    for (const year in stats.years) {
      const yearStats = stats.years[year];

      for (const result of yearStats.results) {
        yearStats.bestPlace = Math.min(yearStats.bestPlace, result.place);

        for (const stage of result.stages) {
          yearStats.totalGames += stage.games.length;
          yearStats.totalWon += stage.games.reduce((total, game) => total + Number(game.won), 0);
        }
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

  function setupCategoriesMedals() {
    return (event.categories || []).reduce<Record<string, StatsMedals>>((acc, category) => {
      acc[category] = [[], [], []];

      return acc;
    }, {});
  }

  function upsertPlayer(player: Player | string): PlayerStats {
    const id = typeof player === 'string' ? player : player.id;
    const playerData = playersHandler.getPlayer(id)!;

    return (players[id] ||= {
      id,
      egd: playerData?.egd,
      name: playerData?.lastUsedName,
      medals: [[], [], []],
      categoriesMedals: setupCategoriesMedals(),
      country: [],
      results: [],
      bestPlace: Infinity,
      totalGames: 0,
      totalWon: 0,
      totalAttended: 0,
      totalSgfs: 0,
      opponents: {},
      score: 0,
    });
  }

  function upsertPlayerCountry(playerStats: PlayerStats, country?: string) {
    if (country && !playerStats.country.includes(country)) {
      playerStats.country.push(country);
    }
  }

  function upsertPlayerResult(playerStats: PlayerStats, player: Player, year: number): PlayerResult {
    const previous = playerStats.results.find((event) => event.year === year);

    if (previous) {
      return previous;
    }

    const newResult: PlayerResult = {
      year,
      place: Infinity,
      name: player.name,
      rank: player.rank,
      country: player.country,
      stages: [],
    };

    playerStats.results.push(newResult);

    return newResult;
  }

  function upsertCountryPlayerResult(
    country: string,
    year: number,
    playerStats: PlayerStats,
    playerResult: PlayerResult
  ) {
    const countryStats = upsertCountry(country);
    const yearsStats = upsertCountryYear(countryStats, year);

    const previousEntry = yearsStats.results.find((result) => result.id === playerStats.id);

    if (previousEntry) {
      return Object.assign(previousEntry, playerResult);
    }

    const newEntry = {
      ...playerResult,
      id: playerStats.id,
    };

    yearsStats.results.push(newEntry);
    return newEntry;
  }

  function upsertCountry(country: string): CountryStats {
    return (countries[country] ||= {
      country,
      medals: [[], [], []],
      categoriesMedals: setupCategoriesMedals(),
      totalGames: 0,
      totalWon: 0,
      bestPlace: Infinity,
      score: 0,
      years: {},
    });
  }

  function upsertCountryYear(countryStats: CountryStats, year: number): CountryResult {
    return (countryStats.years[year] ||= {
      year,
      bestPlace: Infinity,
      totalGames: 0,
      totalWon: 0,
      results: [],
    });
  }

  function upsertMedals(year: number, players: Record<string, Player>, winners?: string[][], category?: string) {
    if (!winners) {
      return;
    }

    const edition = String(year);

    for (const [index, winner] of winners.entries()) {
      if (!winner?.length) {
        continue;
      }

      for (const id of winner) {
        const player = players[id];
        const playerStats = upsertPlayer(player);

        playerStats.medals[index].push(edition);

        if (category) {
          playerStats.categoriesMedals[category][index].push(edition);
        }

        if (player.country) {
          const countryStats = upsertCountry(player.country);

          countryStats.medals[index].push(edition);

          if (category) {
            countryStats.categoriesMedals[category][index].push(edition);
          }
        }
      }
    }
  }
}
