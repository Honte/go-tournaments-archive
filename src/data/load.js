import fs from 'fs/promises';
import fg from 'fast-glob';
import path from 'path';
import slug from 'slug';
import { parse } from 'yaml';
import { createTable } from '@/data/table';

const PLAYER_REGEX = /^(?<name>[\p{Letter} -]+)( (?<rank>[0-9]{1,2}[dkp])?)?$/u;
const GAME_REGEX = /(?<home>[a-z]+)-(?<away>[a-z]+) (?<winner>[a-z]+)(:(?<result>[?a-zA-Z0-9+,.:]+))?( (?<props>.+))?/i;
const GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>([RT?]|\d+([,.]5)?)))?$/i;

export async function loadTournaments() {
  const files = await fg.glob('./src/data/tournaments/*.yml');
  const tournaments = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const json = parse(content);
    const year = Number(path.parse(file).name);
    const players = {};
    const games = {};

    for (const id in json.players) {
      const details = json.players[id].match(PLAYER_REGEX);

      if (!details) {
        throw new Error(`Could not parse player ${json.players[id]} from ${file}`);
      }

      players[id] = {
        id: slug(details.groups.name),
        name: details.groups.name,
        rank: details.groups.rank
      };
    }

    const stages = [];
    for (const stage of json.stages) {
      const target = {
        ...stage
      };

      stages.push(target);

      switch (stage.type) {
        case 'league':
        case 'league-table':
          target.rounds = stage.rounds.map((round) => parseGames(games, round));
          target.table = createTable(target, games, players);
          break;
        case 'match':
        case 'round-robin-table':
          target.games = parseGames(games, stage.games);
          break;
      }
    }

    tournaments.push({
      id: year,
      ...json,
      year,
      games,
      players,
      stages
    });
  }

  return tournaments;
}

function parseGames(repository, games) {
  const ids = [];

  for (const string of games) {
    const game = parseGame(string);
    const id = getId(repository);

    repository[id] = game;
    ids.push(id);
  }

  return ids;
}

function parseGame(string) {
  const parsed = string.match(GAME_REGEX);

  if (!parsed) {
    throw new Error(`Could not parse game ${string})`);
  }

  const {home, away, winner, result, props} = parsed.groups;

  const homePlayer = {
    id: home,
    won: winner === home,
  };

  const awayPlayer = {
    id: away,
    won: winner === away,
  };

  const winnerPlayer = home === winner ? homePlayer : awayPlayer;
  const loserPlayer = home === winner ? awayPlayer : homePlayer;

  if (result) {
    const gameResult = result.match(GAME_RESULT_REGEX);

    if (!gameResult) {
      throw new Error(`Unrecognized game result in ${string}`);
    }

    const {color, score} = gameResult.groups;

    winnerPlayer.score = score;

    if (color.toLowerCase() === 'b') {
      winnerPlayer.color = 'black';
      loserPlayer.color = 'white';
    } else {
      winnerPlayer.color = 'white';
      loserPlayer.color = 'black';
    }
  }

  return {
    players: homePlayer.color === 'white' ? [awayPlayer, homePlayer] : [homePlayer, awayPlayer],
    result,
    props: (props?.split(' ') || [])
      .reduce((map, prop) => {
        const pos = prop.indexOf(':');
        const type = prop.slice(0, pos);

        map[type] = prop.slice(pos + 1);

        return map;
      }, {})
  };
}

function getId(repository) {
  let id;

  do {
    id = Math.random().toString(36).slice(2);
  } while (id in repository);

  return id;
}
