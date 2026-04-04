import EVENT from '@event';
import type { Tournament, TournamentDateSpan } from '@/schema/data';
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
    const json = parse(content);
    const year = Number(path.parse(file).name);
    const games = {};
    const dates = [];
    const stages = [];

    const players = parsePlayers(json.players);

    for (const stage of json.stages) {
      const target = {
        ...stage,
        date: parseDates(stage.date),
      };

      dates.push(...target.date);
      stages.push(target);

      switch (stage.type) {
        case 'league':
          target.rounds = stage.rounds.map((round: string[]) => parseGames(games, round));
          target.table = createTable(target, games, players);
          break;
        case 'ladder-table':
          target.rounds = stage.rounds.map((round: string[]) => parseGames(games, round));
          target.playoffs = stage.playoffs ? parseGames(games, stage.playoffs) : [];
          target.table = createLadderTable(target, games);
          break;
        case 'final':
          target.games = parseGames(games, stage.games);
          target.table = createFinalTable(target, games);
          break;
        case 'round-robin-table':
          target.games = parseGames(games, stage.games);
          target.table = createTableWithoutRounds(target, games, players);
          break;
        default:
          throw new Error(`Unrecognized stage ${stage.type}`);
      }
    }

    tournaments.push({
      id: year,
      ...json,
      ...getDateRange(dates),
      year,
      games,
      players,
      stages,
    });
  }

  return tournaments;
}

function parseDates(date: string): TournamentDateSpan[] {
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
