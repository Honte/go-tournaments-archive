import fs from 'fs/promises';
import fg from 'fast-glob';
import path from 'path';
import { parse } from 'yaml';
import { createTable } from '@/data/table';
import { createLadderTable } from '@/data/tableLadder';
import { createTableWithoutRounds } from '@/data/tableWithoutRounds';
import { createPlayersHandler } from '@/data/players';
import { parseGames } from '@/data/games';

export async function loadTournaments() {
  const files = await fg.glob('./public/data/*.yml');
  const parsePlayers = createPlayersHandler();
  const tournaments = [];

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
          target.rounds = stage.rounds.map((round) => parseGames(games, round));
          target.table = createTable(target, games, players);
          break;
        case 'ladder-table':
          target.rounds = stage.rounds.map((round) => parseGames(games, round));
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

function parseDates(date) {
  if (Array.isArray(date)) {
    return date.map(parseDates).flat();
  }

  const [start, end] = date.split(' - ');

  if (!end) {
    return [{ start, end: start }];
  }

  return [{ start, end }];
}

function getDateRange(dates) {
  const all = dates
    .reduce((list, { start, end }) => {
      list.push([start, +new Date(start)]);
      list.push([end, +new Date(end)]);
      return list;
    }, [])
    .sort((a, b) => b[1] - b[0]);

  return {
    start: all[0][0],
    end: all[all.length - 1][0],
  };
}

function createFinalTable(stage, games) {
  const players = {};

  for (const id of stage.games) {
    const [a, b] = games[id].players;

    addGame(a, b.id, id);
    addGame(b, a.id, id);
  }

  const [home, away] = Object.keys(players);

  if (stage.includePrevious) {
    for (const game of iterateGames(games, home, away)) {
      if (!stage.games.includes(game.id)) {
        const [a, b] = game.players;

        addGame(a, b.id, game.id);
        addGame(b, a.id, game.id);

        players[a.id].prevScore = Number(a.won);
        players[b.id].prevScore = Number(b.won);
        break;
      }
    }
  }

  const result = players[home].wins > players[away].wins ? [home, away] : [away, home];

  return result.map((p, index) => ({
    ...players[p],
    place: index + 1,
  }));

  function addGame(player, opponent, game) {
    players[player.id] ||= {
      id: player.id,
      place: 0,
      games: [],
      wins: 0,
    };

    players[player.id].wins += Number(player.won);
    players[player.id].games.push({
      opponent,
      won: player.won,
      game,
    });
  }
}

function* iterateGames(games, playerA, playerB) {
  for (const id in games) {
    const game = games[id];
    const [a, b] = game.players;

    if ((a.id === playerA && b.id === playerB) || (a.id === playerB && b.id === playerA)) {
      yield game;
    }
  }
}
