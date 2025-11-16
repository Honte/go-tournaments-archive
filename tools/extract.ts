import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GameProps } from '@/schema/data';
import { diffLines } from 'diff';
import mysql from 'mysql2/promise';
import { stringify } from 'yaml';
import { parseGames } from '@/data/games';
import { parsePlayers } from '@/data/players';
import { createTable } from '@/data/table';
import { cleanSgf } from './sgf';

const __dirname = dirname(fileURLToPath(import.meta.url));

extractFromDatabase({
  host: 'localhost',
  user: 'user',
  password: 'pass',
  port: 9002,
  database: 'baza1094_mp',
  year: '2025',

  location: 'Gdańsk',
  referee: 'Tomasz Dec',
});

type ExtractOptions = {
  host: string;
  user: string;
  password: string;
  port: number;
  database: string;
  year: string | number;
  location: string;
  referee: string;
  prefix?: string;
  website?: string;
  sgfPrefix?: string;
  time?: string;
  komi?: number;
  breakers?: string[];
  egd?: string;
  outputSgfDir?: string;
  outputYml?: string;
};

type SqlPlayer = {
  id: number;
  starting_position: number;
  active: boolean;
  first_name: string;
  last_name: string;
  ranking: string;
};

type SqlGame = {
  id: number;
  round: number;
  game_order: number;
  black_id: number;
  white_id: number;
  winner: number;
  result: string;
  sgf: string;
  ogs: string;
};

type SqlRound = {
  id: number;
  time: string;
};

async function extractFromDatabase({
  host,
  user,
  password,
  port,
  database,
  year,
  location,
  referee,
  prefix = `mp${year}_`,
  website = `https://mp.go.art.pl/${year}`,
  sgfPrefix = `${website}/files/game/sgf`,
  time = 'fischer 60m + 30s',
  komi = 6.5,
  breakers = ['wins', 'sodos', 'direct', 'starting'],
  egd,
  outputSgfDir = join(__dirname, `../public/sgf/${year}`),
  outputYml = join(__dirname, `../public/data/${year}.yml`),
}: ExtractOptions): Promise<void> {
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    port,
    database,
  });

  // @ts-ignore
  const [playersRows] = await connection.execute<SqlPlayer[]>(`SELECT * FROM ${prefix}players`);
  // @ts-ignore
  const [gamesRows] = await connection.execute<SqlGame[]>(`SELECT * FROM ${prefix}games`);
  // @ts-ignore
  const [roundsRows] = await connection.execute<SqlRound[]>(`SELECT * FROM ${prefix}rounds`);

  connection.end();

  const start = toIsoDate(roundsRows.at(0).time);
  const end = toIsoDate(roundsRows.at(-1).time);

  const players = {};
  const playerDbIdToId = {};

  playersRows.sort((a, b) => a.starting_position - b.starting_position);

  for (const player of playersRows) {
    if (!player.active) {
      continue;
    }

    let id = player.first_name.toLowerCase()[0] + player.last_name.toLowerCase()[0];

    if (players[id]) {
      id += player.id;
    }

    const [rank, kyudan] = player.ranking.split(' ');

    playerDbIdToId[player.id] = id;
    players[id] = `${player.first_name} ${player.last_name} ${rank}${kyudan[0]}`;
  }

  const parsedPlayers = parsePlayers(players);

  const gamesRowsByRound = [];
  for (const game of gamesRows) {
    (gamesRowsByRound[game.round - 1] ||= []).push([game, game.game_order ?? 5]);
  }
  for (const round of gamesRowsByRound) {
    round.sort((a, b) => a[1] - b[1]);
  }

  const rounds = [];
  for (const [round, roundGames] of gamesRowsByRound.entries()) {
    for (const [board, [game]] of roundGames.entries()) {
      const black = playerDbIdToId[game.black_id];
      const white = playerDbIdToId[game.white_id];
      const winner = playerDbIdToId[game.winner];
      const result = game.result.replace(',', '.');
      const color = winner === black ? 'B' : 'W';

      const props: GameProps = {};
      const sgfs = [];

      if (game.sgf?.includes('baduk')) {
        console.warn('BADUK games require manual handling');
      } else if (game.sgf?.includes('.sgf')) {
        sgfs.push(`${sgfPrefix}/${game.id}/${parse(game.sgf).base.replace(/\\s/g, '')}`);
      } else if (game.sgf?.includes('online-go')) {
        const id = game.sgf.replace(/\/+$/, '').match(/(\d+)$/)?.[1];

        sgfs.push(toOgsLink(id, 'reviews'));
      }

      if (game.ogs) {
        if (game.ogs.includes('game')) {
          const id = game.ogs.match(/(\d+)$/)?.[1];
          sgfs.push(toOgsLink(id, 'games'));
        } else if (game.ogs.includes('review') || game.ogs.includes('demo')) {
          const id = game.ogs.match(/(\d+)$/)?.[1];
          sgfs.push(toOgsLink(id, 'reviews'));
        } else {
          sgfs.push(toOgsLink(game.ogs, 'reviews'));
        }
      }

      if (game.analysis && game.analysis.includes('ai-sensei')) {
        props.ai = game.analysis;
      }

      if (game.video && game.video.includes('youtube')) {
        if (game.video.includes('live')) {
          props.yt = game.video.replace('live/', 'watch?v=');
        } else {
          props.yt = game.video;
        }
      }

      const parsedBlack = parsedPlayers[black];
      const parsedWhite = parsedPlayers[white];
      const sgf = await getSgf({
        sgfs,
        output: join(outputSgfDir, `${year}-${round + 1}-${parsedBlack.id}-${parsedWhite.id}.sgf`),
        props: {
          CA: 'UTF-8',
          AP: null,
          RE: `${color}+${result}`,
          PB: parsedBlack.name,
          PW: parsedWhite.name,
          BR: parsedBlack.rank,
          WR: parsedWhite.rank,
          CP: null,
          TM: null,
          OT: null,
          PC: location,
          EV: `Polish Go Championship ${year}`,
          RU: (val) => (val ? val.toLowerCase() : null),
          GN: `Round ${round + 1} - Board ${board + 1}`,
        },
      });

      if (sgf) {
        props.sgf = `${year}/${sgf}`;
      }

      const output = [];

      output.push(
        `${black}-${white}`,
        `${winner}:${color}+${result}`,
        ...Object.entries(props).map(([key, value]) => `${key}:${value}`)
      );

      (rounds[round] ||= []).push(output.join(' '));
    }
  }

  // establish final order

  const testGames = {};
  const testStage = {
    breakers,
    date: [{ start, end }],
    rounds: rounds.map((round) => parseGames(testGames, round)),
  };
  const testTable = createTable(testStage, testGames, parsedPlayers);

  const result = stringify(
    {
      location,
      referee,
      website,
      players,
      top: testTable.slice(0, 3).map((entry) => entry.id),
      stages: [
        {
          type: 'league',
          date: `${start} - ${end}`,
          egd,
          time,
          komi,
          breakers,
          rounds,
        },
      ],
    },
    { lineWidth: 0 }
  );

  await writeFile(outputYml, result, 'utf-8');

  console.log('Done');
}

function toIsoDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function toOgsLink(id, type = 'reviews', includeComments = false) {
  return `https://online-go.com/api/v1/${type}/${id}/sgf?without-comments=${includeComments ? 0 : 1}`;
}

async function getSgf({ sgfs, props, output }) {
  if (!sgfs?.length) {
    return null;
  }

  const expectedResult = props.RE;
  const result = [];

  for (const url of sgfs) {
    const res = await fetch(url);

    if (res.status === 429 && url.includes('online-go')) {
      throw new Error('Too many OGS requests - please wait a minute');
    }

    const content = await res.text();
    const gameResult = content
      .match(/RE\[(.*?)]/)?.[1]
      .trim?.()
      .replaceAll?.(',', '.')
      .toUpperCase?.();

    if (gameResult && gameResult !== '?' && gameResult.trim() !== expectedResult) {
      console.warn(`Result for game ${url} is different: ${gameResult} vs ${expectedResult}`);
    }

    result.push({
      source: url,
      cleaned: cleanSgf(content, props),
      original: content,
    });
  }

  if (!result.length) {
    return null;
  }

  let same = true;
  if (result.length > 1) {
    for (let i = 1; i < result.length; i++) {
      const diffs = diffLines(result[i - 1].cleaned, result[i].cleaned).filter((r) => r.added || r.removed);

      if (diffs.length > 1) {
        same = false;
      }
    }
  }

  if (!same) {
    console.warn(`SGFs for game ${output} are not the same - please investigate`);
    for (const [index, { source, original }] of result.entries()) {
      const gameFile = `./temp-${index}.sgf`;
      await writeFile(gameFile, original, 'utf-8');
      console.warn(`Saved ${source} copy to ${gameFile}`);
    }
    return null;
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, result[0].cleaned, 'utf-8');

  return parse(output).base;
}
