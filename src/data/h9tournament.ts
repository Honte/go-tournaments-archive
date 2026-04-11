import EVENT from '@event';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Game, GamePlayer, LeagueStage, Player, TableResult, TournamentDetails } from '@/schema/data';
import { InputTournamentStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import { H9Game, parseH9 } from '@/libs/h9';
import { getGameId, parseGame } from '@/data/games';
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
  const {
    file,
    breakers,
    scoringColumns,
    rules,
    findSharedPlaces = false,
    sharedPlaces,
    customBreakers,
    games,
  } = stage;

  const content = await readFile(join(EVENT_DATA_DIR, file), 'utf-8');
  const tournament = parseH9(content);
  const table: TableResult[] = [];
  const processedGamesMap = new Map<string, Game>();
  const existingGamesMap = new Map<string, Game>();
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
      breakers: {
        rank: getRankValue(player.rank),
        wins: 0,
        sos: 0,
        sodos: 0,
        sosos: 0,
        score: 0,
        mms: 0,
        starting: 0,
      },
      won: [],
      lost: [],
      games: [],
    };

    table.push(tableEntry);

    for (let i = 0; i < player.scores.length; i++) {
      const breaker = scoringColumns?.[i];

      if (!breaker) {
        continue;
      }

      const value = Number(player.scores[i]);

      if (isNaN(value)) {
        continue;
      }

      tableEntry.breakers[breaker] = value;
    }
  }

  if (games?.length) {
    for (const gameString of games) {
      const id = getGameId(gamesMap);
      const game = parseGame(gameString, id, false);
      const blackPlace = Number(game.players[0].id);
      const whitePlace = Number(game.players[1].id);
      const localId = [blackPlace, whitePlace].sort().join('-');
      const blackPlayerId = table[blackPlace - 1]?.id;
      const whitePlayerId = table[whitePlace - 1]?.id;

      if (blackPlayerId && whitePlayerId) {
        game.players[0].id = blackPlayerId;
        game.players[1].id = whitePlayerId;
        existingGamesMap.set(localId, game);
      }
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

      if (!processedGamesMap.has(localId)) {
        let parsedGame = existingGamesMap.get(localId);

        if (!parsedGame) {
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

          parsedGame = {
            id: getGameId(gamesMap),
            players: [isCurrentBlack ? playerA : playerB, isCurrentBlack ? playerB : playerA],
            result: getGameResult(game.result, game.color),
            props: {},
          } satisfies Game;
        }

        processedGamesMap.set(localId, parsedGame);
        gamesMap[parsedGame.id] = parsedGame;
        (rounds[round] ||= []).push(parsedGame.id);
      }

      current.games.push({
        game: processedGamesMap.get(localId)!.id,
        won: game.result === '+',
        opponent: opponentId,
        result: game.result,
        index: game.opponent,
      });
    }
  }

  for (const round of rounds) {
    round.sort((a, b) => {
      const gameA = gamesMap[a]!;
      const gameB = gamesMap[b]!;

      if ((gameA.props.sgf && gameB.props.sgf) || gameA.props.sgf === gameB.props.sgf) {
        return 0;
      }

      return gameA.props.sgf ? -1 : 1;
    });
  }

  if (findSharedPlaces && breakers) {
    for (let i = 1; i < table.length; i++) {
      const prev = table[i - 1];
      const current = table[i];
      let isShared = true;

      for (const breaker of breakers) {
        if (current.breakers[breaker] !== prev.breakers[breaker]) {
          isShared = false;
          break;
        }
      }

      current.place = isShared ? prev.place : current.index;
    }
  } else if (sharedPlaces?.length) {
    const map = new Map<number, number>();
    for (const shared of sharedPlaces) {
      const [from, to] = shared.split('-').map(Number);

      for (let index = from; index <= to; index++) {
        map.set(index, from);
      }
    }

    for (let i = 1; i < table.length; i++) {
      const current = table[i];

      current.place = map.get(current.index) ?? current.index;
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
    customBreakers,
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
