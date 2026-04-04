import EVENT from '@event';
import EVENT_CONFIG from '@event/config';
import { Game, LeagueStage, Player, Stage, Tournament, TournamentDateSpan } from '@/schema/data';
import { InputStage, InputTournament } from '@/schema/input';
import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'yaml';
import { createFinalTable } from '@/data/final';
import { parseGames } from '@/data/games';
import { createPlayersHandler } from '@/data/players';
import { createTable } from '@/data/table';
import { createLadderTable } from '@/data/tableLadder';
import { createTableWithoutRounds } from '@/data/tableWithoutRounds';

export async function loadTournaments() {
  const files = await fg.glob(`./events/${EVENT}/data/*.yml`);
  const parsePlayers = createPlayersHandler();
  const tournaments: Tournament[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const json = parse(content) as InputTournament;
    const year = Number(path.parse(file).name);
    const games: Record<string, Game> = {};
    const dates = [];
    const stages = [];

    const players = parsePlayers(json.players);

    for (const stageJson of json.stages) {
      const stage = parseStage(stageJson, players, games);

      if (stage.date) {
        dates.push(...stage.date);
      }

      stages.push(stage);
    }

    tournaments.push({
      ...json,
      id: year,
      country: json.country ?? EVENT_CONFIG.defaultCountry,
      location: json.location ?? '',
      ...getDateRange(dates),
      year,
      games,
      players,
      stages,
      top: json.top ?? [],
    });
  }

  return tournaments;
}

function parseDates(date?: string | string[]): TournamentDateSpan[] {
  if (date === undefined) {
    return [];
  }

  if (Array.isArray(date)) {
    return date.map(parseDates).flat();
  }

  const [start, end] = date.split(' - ');

  if (!end) {
    return [{ start, end: start }];
  }

  return [{ start, end }];
}

function getDateRange(dates: TournamentDateSpan[]) {
  const all = dates
    .reduce<[string, number][]>((list, { start, end }) => {
      list.push([start, +new Date(start)]);
      list.push([end, +new Date(end)]);
      return list;
    }, [])
    .sort((a, b) => b[1] - (b[0] as unknown as number));

  return {
    start: all[0][0],
    end: all[all.length - 1][0],
  };
}

function parseStage(stage: InputStage, playersMap: Record<string, Player>, gamesMap: Record<string, Game>): Stage {
  const date = parseDates(stage.date);

  switch (stage.type) {
    case 'league': {
      const rounds = stage.rounds.map((round: string[]) => parseGames(gamesMap, round));

      return {
        ...stage,
        date,
        rounds,
        table: createTable({
          rounds,
          gamesMap,
          playersMap,
          order: stage.order,
          breakers: stage.breakers,
        }),
      } satisfies LeagueStage;
    }
    case 'ladder-table': {
      const rounds = stage.rounds.map((round: string[]) => parseGames(gamesMap, round));
      const playoffs = stage.playoffs ? parseGames(gamesMap, stage.playoffs) : [];

      return {
        ...stage,
        date,
        rounds,
        playoffs,
        table: createLadderTable({
          rounds,
          playoffs,
          gamesMap,
          order: stage.order,
        }),
      };
    }
    case 'final': {
      const games = parseGames(gamesMap, stage.games);

      return {
        ...stage,
        date,
        games,
        table: createFinalTable({
          games,
          gamesMap,
          includePrevious: stage.includePrevious ?? false,
        }),
      };
    }
    case 'round-robin-table': {
      const games = parseGames(gamesMap, stage.games);

      return {
        ...stage,
        date,
        games,
        table: createTableWithoutRounds({
          games,
          gamesMap,
          playersMap
        }),
      };
    }
    default:
      throw new Error(`Unrecognized stage ${stage.type}`);
  }
}
