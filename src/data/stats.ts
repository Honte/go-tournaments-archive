import type {
  CategoryPlayer,
  CategoryStats,
  CountryResult,
  CountryStats,
  Game,
  Player,
  PlayerGame,
  PlayerResult,
  PlayerStats,
  Stage,
  Stats,
  StatsMedals,
  Tournament,
} from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import { getGameStats } from '@/libs/games';
import type { PlayersHandler } from '@/data/players';

export function calculateStats(
  event: EventDefinition,
  tournaments: Tournament[],
  playersHandler: PlayersHandler
): Stats {
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
  let color = 0;
  let black = 0;
  let white = 0;
  let resign = 0;
  let timeout = 0;
  let draws = 0;
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

        for (const game of iteratePlayerGames(player)) {
          if (game && game.opponent) {
            const globalGame = tournamentGames[game.game];
            const opponent = players[game.opponent];

            playerGames.push({
              id: opponent?.id ?? 'BYE',
              country: players[game.opponent]?.country,
              rank: players[game.opponent]?.rank,
              won: game.won,
              drawn: game.drawn,
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

        const playerCategories: Record<string, number | '?'> = {};

        if (event.categories?.length && 'categories' in player && player.categories) {
          for (const category of event.categories) {
            const place = player.categories[category];

            if (place) {
              playerCategories[category] = place;
            }
          }
        }

        const stageResult = {
          type: stage.type,
          name: stage.name,
          place: player.place,
          games: playerGames,
          categories: playerCategories,
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

      if (game.players[0].color) {
        color++;
      }

      if (game.draw) {
        draws++;
      }

      if (game.result?.startsWith('B')) {
        black++;
      } else if (game.result?.startsWith('W')) {
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
        const outcomes = getGameStats(stage.games);

        player.totalGames += outcomes.games;
        player.totalWon += outcomes.won;
        player.totalDrawn += outcomes.drawn;
      }
    }
  }

  for (const country in countries) {
    const stats = countries[country];
    const [gold, silver, bronze] = stats.medals;

    stats.score = gold.length * 10_000 + silver.length * 100 + bronze.length;

    for (const year in stats.years) {
      const yearStats = stats.years[year];

      yearStats.results.sort((a, b) => a.place - b.place);

      for (const result of yearStats.results) {
        yearStats.bestPlace = Math.min(yearStats.bestPlace, result.place);

        for (const stage of result.stages) {
          const outcomes = getGameStats(stage.games);

          yearStats.totalGames += outcomes.games;
          yearStats.totalWon += outcomes.won;
          yearStats.totalDrawn += outcomes.drawn;
        }
      }

      stats.totalWon += yearStats.totalWon;
      stats.totalDrawn += yearStats.totalDrawn;
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
      draws,
      relays,
      streams,
      analysis,
      black,
      white,
      color,
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
      name: playerData?.displayName ?? playerData?.lastUsedName ?? id,
      original: playerData?.originalName,
      nickname: playerData ? [...playerData.nickname] : undefined,
      medals: [[], [], []],
      categoriesMedals: setupCategoriesMedals(),
      country: [],
      results: [],
      bestPlace: Infinity,
      totalGames: 0,
      totalWon: 0,
      totalDrawn: 0,
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

  function upsertCountry(code: string): CountryStats {
    return (countries[code] ||= {
      code,
      medals: [[], [], []],
      categoriesMedals: setupCategoriesMedals(),
      totalGames: 0,
      totalWon: 0,
      totalDrawn: 0,
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
      totalDrawn: 0,
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

function* iteratePlayerGames(result: Stage['table'][0]) {
  if ('games' in result && result.games?.length) {
    for (const game of result.games) {
      yield game;
    }
  }

  if ('playoffs' in result && result.playoffs?.length) {
    for (const game of result.playoffs) {
      yield game;
    }
  }
}
