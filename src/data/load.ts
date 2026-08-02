import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { parse } from 'yaml';
import type { Game, Player, Tournament, TournamentDateSpan, TournamentDetails } from '@/schema/data';
import type { EventContext, EventData } from '@/schema/event';
import type { InputTournament } from '@/schema/input';
import { parseTop } from '@/libs/stage';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { createPlayersHandler } from '@/data/players';
import { parseStage } from '@/data/stages';
import { calculateStats } from '@/data/stats';

export async function loadData(event: EventContext): Promise<EventData> {
  const files = await fg.glob(`./events/${event.id}/data/*.yml`);
  const playersHandler = createPlayersHandler(await readEventPlayersFile(event.id));
  const tournaments: Tournament[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const json = parse(content) as InputTournament;
    const year = Number(path.parse(file).name);
    const games: Record<string, Game> = {};
    const dates = [];
    const stages = [];

    const players = playersHandler.loadJson(json.players);
    const tournamentDetails: TournamentDetails = {
      ...json,
      year,
      country: json.country,
      location: json.location ?? '',
      categories: json.categories ?? [],
      top: parseTop(json.top),
    };

    const stageCountries = new Set<string>();
    const stageLocations = new Set<string>();

    if (json.stages?.length) {
      for (const [stageIndex, stageJson] of json.stages.entries()) {
        try {
          const stage = await parseStage({
            event,
            stage: stageJson,
            stageIndex,
            playersMap: players,
            gamesMap: games,
            tournamentDetails,
            playersHandler,
          });

          if (stage.date) {
            dates.push(...stage.date);
          }

          stages.push(stage);

          if (stage.country) {
            stageCountries.add(stage.country);
          }

          if (stage.location) {
            stageLocations.add(stage.location);
          }
        } catch (e) {
          console.error(`\nError parsing tournament: ${file}`);
          console.error(e);
          console.log();
        }
      }
    }

    const playersIdMap = createPlayersIdMap(players);

    if (tournamentDetails.top) {
      tournamentDetails.top = replaceFullNamesWithIds(tournamentDetails.top, playersIdMap);
    }

    if (tournamentDetails.categoriesTop) {
      for (const category in tournamentDetails.categoriesTop) {
        tournamentDetails.categoriesTop[category] = replaceFullNamesWithIds(
          tournamentDetails.categoriesTop[category],
          playersIdMap
        );
      }
    }

    if (!tournamentDetails.country) {
      tournamentDetails.country = stageCountries.size === 1 ? stageCountries.values().next().value : undefined;
    }

    if (!tournamentDetails.location) {
      tournamentDetails.location = Array.from(stageLocations).join(', ');
    }

    for (const gameId in games) {
      const game = games[gameId];

      if (game.props.sgf) {
        game.path = `./events/${event.id}/sgf/${game.props.sgf}`;

        if (event.generatePngs) {
          game.props.png = game.props.sgf.replace('.sgf', '.png');
        }

        if (event.generateSvgs) {
          game.props.svg = game.props.sgf.replace('.sgf', '.svg');
        }

        if (event.generateJpgs) {
          game.props.jpg = game.props.sgf.replace('.sgf', '.jpg');
        }
      }
    }

    tournaments.push({
      ...tournamentDetails,
      ...getDateRange(dates),
      id: year,
      games,
      players,
      stages,
      hasSgfs: Object.values(games).some((game) => game.props?.sgf),
    });
  }

  tournaments.sort((a, b) => a.year - b.year);

  const stats = calculateStats(event, tournaments, playersHandler);

  // decorate every player entry with `hasStats` flag
  for (const tournament of tournaments) {
    for (const id in tournament.players) {
      const player = tournament.players[id];

      player.hasStats = player.id in stats.players;
    }
  }

  const playersSummaries = Object.values(stats.players).map((player) => ({
    ...player,
    results: undefined,
    opponents: undefined,
  }));

  const countriesSummaries = Object.values(stats.countries).map((country) => ({
    ...country,
    years: undefined,
  }));

  return {
    tournaments,
    stats,
    summary: {
      attendants: playersSummaries.sort((a, b) => b.totalAttended - a.totalAttended).slice(0, 10),
      medalists: playersSummaries.filter((player) => player.score > 0).sort((a, b) => b.score - a.score),
      countryMedals: countriesSummaries.filter((country) => country.score > 0).sort((a, b) => b.score - a.score),
      totalStats: stats.summary,
    },
  };
}

function getDateRange(dates: TournamentDateSpan[]) {
  if (!dates.length) {
    return {};
  }

  let start = dates[0].start;
  let end = dates[0].end;

  for (const { start: s, end: e } of dates) {
    if (new Date(s) < new Date(start)) {
      start = s;
    }

    if (new Date(e) > new Date(end)) {
      end = e;
    }
  }

  return { start, end };
}

function replaceFullNamesWithIds(top: string[][], idsMap: Record<string, string>) {
  return top.map((place) => place.map((id) => (id ? idsMap[id.replace('_', ' ')] : id)).filter(Boolean));
}

function createPlayersIdMap(players: Record<string, Player>) {
  const idsMap: Record<string, string> = {};

  for (const id in players) {
    const player = players[id];

    idsMap[id] = id;
    idsMap[player.name] = id;

    if (player.egd) {
      idsMap[player.egd] = id;
    }
  }

  return idsMap;
}
