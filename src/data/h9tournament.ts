import EVENT from '@event';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Game, GamePlayer, LeagueStage, Player, TableResult, TournamentDetails } from '@/schema/data';
import { InputTournamentStage } from '@/schema/input';
import { isScoringBreaker } from '@/libs/breakers';
import { parseDates } from '@/libs/dates';
import { H9Game, parseH9 } from '@/libs/h9';
import { getGameId } from '@/data/games';
import type { PlayersHandler } from '@/data/players';
import { getRankValue } from '@/data/rank';

const EVENT_DATA_DIR = `./events/${EVENT}/data/`;

export async function loadH9Tournament({
  stage,
  playersMap,
  playersHandler,
  gamesMap,
  tournamentDetails,
}: {
  stage: InputTournamentStage;
  playersMap: Record<string, Player>;
  playersHandler: PlayersHandler;
  gamesMap: Record<string, Game>;
  tournamentDetails: TournamentDetails;
}): Promise<LeagueStage> {
  const { file, breakers, scoringColumns, rules, findSharedPlaces = false, sharedPlaces } = stage;

  const content = await readFile(join(EVENT_DATA_DIR, file), 'utf-8');
  const tournament = parseH9(content);
  const table: TableResult[] = [];
  const localGamesMap = new Map<string, Game>();
  const rounds: string[][] = [];

  tournamentDetails.country ||= tournament.country;
  tournamentDetails.location ||= tournament.location;

  for (const player of tournament.results) {
    const newPlayer = playersHandler.loadPlayer({
      name: `${player.name} ${player.surname}`,
      country: player.country,
      rank: player.rank,
      egd: player.egd,
    });

    playersMap[newPlayer.id] = newPlayer;

    const tableEntry: TableResult = {
      id: newPlayer.id,
      place: player.place,
      index: table.length + 1,
      rank: getRankValue(player.rank),
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      score: 0,
      mms: 0,
      starting: 0,
      won: [],
      lost: [],
      games: [],
    };

    table.push(tableEntry);

    for (let i = 0; i < player.scores.length; i++) {
      const breaker = scoringColumns?.[i];

      if (!isScoringBreaker(breaker)) {
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
          result: getGameResult(game.result, game.color),
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

  if (findSharedPlaces && breakers) {
    for (let i = 1; i < table.length; i++) {
      const prev = table[i - 1];
      const current = table[i];
      let exAequo = true;

      for (const breaker of breakers) {
        if (!isScoringBreaker(breaker)) {
          continue;
        }

        if (current[breaker] !== prev[breaker]) {
          exAequo = false;
          break;
        }
      }

      current.place = exAequo ? prev.place : prev.place + 1;
    }
  } else if (sharedPlaces?.length) {
    const map = new Map<number, boolean>();
    for (const shared of sharedPlaces) {
      const [from, to] = shared.split('-').map(Number);

      for (let index = from + 1; index <= to; index++) {
        map.set(index, true);
      }
    }

    for (let i = 1; i < table.length; i++) {
      const current = table[i];
      const prev = table[i - 1].place;

      current.place = prev + Number(!map.has(current.index));
    }
  }

  if (!tournamentDetails.top.length) {
    const winners: string[][] = [];
    for (const player of table) {
      if (player.place <= 3) {
        (winners[player.place - 1] ||= []).push(player.id);
      } else {
        break;
      }
    }

    tournamentDetails.top = winners.map((winner) => winner.join(','));
  }

  return {
    type: 'tournament',
    egd:
      (stage.egd ?? tournament.id)
        ? `https://europeangodatabase.eu/EGD/Tournament_Card.php?&key=${tournament.id}`
        : undefined,
    breakers,
    rules,
    time: stage.time ?? (tournament.time ? `AT ${tournament.time} min` : undefined),
    komi: stage.komi ?? tournament.komi,
    table,
    rounds,
    date: parseDates(stage.date ?? tournament.dates),
  } satisfies LeagueStage;
}

function getGameResult(result: H9Game['result'], color: H9Game['color']) {
  switch (result) {
    case '+':
      return color ? (color === 'black' ? 'B+' : 'W+') : '+';
    case '-':
      return color ? (color === 'black' ? 'W+' : 'B+') : '+';
    case '=':
      return '=';
  }
}
