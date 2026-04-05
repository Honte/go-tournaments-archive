import EVENT from '@event';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Breaker, Game, GamePlayer, LeagueStage, Player, TableResult } from '@/schema/data';
import { InputTournamentStage } from '@/schema/input';
import { parseH9 } from '@/libs/h9';
import { getGameId } from '@/data/games';
import { getPlayerId } from '@/data/players';
import { getRankValue } from '@/data/rank';

const EVENT_DATA_DIR = `./events/${EVENT}/data/`;

export async function loadH9Tournament({
  stage,
  playersMap,
  gamesMap,
}: {
  stage: InputTournamentStage;
  playersMap: Record<string, Player>;
  gamesMap: Record<string, Game>;
}): Promise<LeagueStage> {
  const { file, date, egd, komi, breakers, scoringColumns, rules, time, sgfsDir } = stage;

  const content = await readFile(join(EVENT_DATA_DIR, file), 'utf-8');
  const tournament = parseH9(content);
  const playerNameMap: Record<string, string> = {};
  const table: TableResult[] = [];
  const localGamesMap = new Map<string, Game>();
  const rounds: string[][] = [];

  for (const player of tournament.results) {
    const name = `${player.name} ${player.surname}`;
    const id = getPlayerId(name, playerNameMap);

    if (id in playersMap) {
      continue;
    }

    playersMap[id] = {
      id,
      name,
      country: player.country,
      rank: player.rank,
      egd: player.egd,
    };

    const tableEntry: TableResult = {
      id,
      place: player.place,
      index: table.length,
      rank: getRankValue(player.rank),
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      score: 0,
      starting: 0,
      won: [],
      lost: [],
      games: [],
    };

    table.push(tableEntry);

    for (let i = 0; i < player.scores.length; i++) {
      const breaker = scoringColumns?.[i];

      if (!breaker || breaker === Breaker.DIRECT_MATCH) {
        continue;
      }

      const value = Number(player.scores[i]);

      if (isNaN(value)) {
        continue;
      }

      tableEntry[breaker] = value;
    }
  }

  for (const player of tournament.results) {
    const current = table[player.place - 1];
    const currentId = current.id;

    for (let round = 0; round < player.games.length; round++) {
      const game = player.games[round];

      if (!game) {
        current.games.push(null);
        continue;
      }

      const localId = [player.place, game.opponent].sort().join('-');
      const opponentId = table[game.opponent - 1]?.id ?? 'BYE';

      if (game.result === '+') {
        current.won.push(opponentId);
      } else if (game.result === '-') {
        current.lost.push(opponentId);
      }

      if (!localGamesMap.has(localId)) {
        const isCurrentBlack = game.color ? game.color === 'black' : game.result === '+';
        const playerA = {
          id: currentId,
          won: game.result === '+',
          color: game.color ? (game.color === 'black' ? 'black' : 'white') : undefined,
        } satisfies GamePlayer;

        const playerB = {
          id: opponentId,
          won: game.result === '-',
          color: game.color ? (game.color === 'black' ? 'white' : 'black') : undefined,
        } satisfies GamePlayer;

        const parsedGame = {
          id: getGameId(gamesMap),
          players: [isCurrentBlack ? playerA : playerB, isCurrentBlack ? playerB : playerA],
          result: game.result,
          props: {},
        } satisfies Game;

        localGamesMap.set(localId, parsedGame);
        gamesMap[parsedGame.id] = parsedGame;

        (rounds[round] ||= []).push(parsedGame.id);
      }

      current.games.push({
        game: localGamesMap.get(localId)!.id,
        won: game.result === '+',
        opponent: opponentId,
        result: game.result,
        index: game.opponent,
      });
    }
  }

  return {
    type: 'tournament',
    egd,
    komi,
    breakers,
    rules,
    time,
    table,
    rounds,
  } satisfies LeagueStage;
}
