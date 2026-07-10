import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Game, GamePlayer, LeagueStage, TableResult } from '@/schema/data';
import type { InputTournamentStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import { buildLocalGameId, H9Game, parseH9 } from '@/libs/h9';
import { getRankValue } from '@/libs/rank';
import { getGameId, parseGame } from '@/data/games';
import type { ParseStageProps } from '@/data/stages';

export async function loadH9Tournament({
  event,
  stage,
  stageIndex,
  playersMap,
  playersHandler,
  gamesMap,
  tournamentDetails,
}: Omit<ParseStageProps, 'stage'> & { stage: InputTournamentStage }): Promise<LeagueStage> {
  const {
    name,
    file,
    breakers,
    columns,
    scoringColumns,
    rules,
    findSharedPlaces = false,
    sharedPlaces,
    customBreakers,
    games,
    notes,
    time,
    komi,
    date,
    egd,
    promoted,
    placeOffset,
    category,
    location,
    country,
    excluded,
    collapsed,
  } = stage;

  const content = await readFile(join(`./events/${event.id}/data/`, file), 'utf-8');
  const tournament = parseH9(content);
  const table: TableResult[] = [];
  const processedGamesMap = new Map<string, Game>();
  const existingGamesMap = new Map<string, Game>();
  const tournamentPlaceMap = new Map<number, TableResult>();
  const rounds: string[][] = [];

  for (const player of tournament.results) {
    const newPlayer = playersHandler.loadPlayer({
      name: `${player.name} ${player.surname}`,
      country: player.country,
      rank: player.rank && event.unknownRanks?.includes(player.rank) ? undefined : player.rank,
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

    tournamentPlaceMap.set(player.place, tableEntry);
    table.push(tableEntry);

    for (let i = 0; i < player.scores.length; i++) {
      const breaker = scoringColumns?.[i];

      if (!breaker) {
        continue;
      }

      const raw = player.scores[i];
      const value = parseScore(raw);

      if (event.categories?.includes(breaker)) {
        if (raw === '?' || value > 0) {
          (tableEntry.categories ||= {})[breaker] = raw === '?' ? raw : value;
        }
        continue;
      }

      if (isNaN(value)) {
        continue;
      }

      tableEntry.breakers[breaker] = value;
    }
  }

  if (games?.length) {
    for (const gameString of games) {
      const id = getGameId(gamesMap);
      const game = parseGame(gameString, id, stageIndex, false);
      const blackPlace = Number(game.players[0].id);
      const whitePlace = Number(game.players[1].id);
      const localId = buildLocalGameId(blackPlace, whitePlace, game.props.round);
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
    const current = tournamentPlaceMap.get(player.place)!;
    const currentId = current.id;

    for (let round = 0; round < player.games.length; round++) {
      const game = player.games[round];

      if (!game) {
        current.games.push(null);
        continue;
      }

      const localId = buildLocalGameId(player.place, game.opponent, game.round);
      const opponent = tournamentPlaceMap.get(game.opponent);
      const opponentId = opponent?.id ?? 'BYE';

      if (game.result === '+') {
        current.won.push(opponentId);
      } else if (game.result === '-') {
        current.lost.push(opponentId);
      }

      if (!processedGamesMap.has(localId)) {
        let parsedGame =
          existingGamesMap.get(localId) ?? existingGamesMap.get(buildLocalGameId(player.place, game.opponent));

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
            stage: stageIndex,
            players: [isCurrentBlack ? playerA : playerB, isCurrentBlack ? playerB : playerA],
            result: getGameResult(game.result, game.color),
            props: {},
          } satisfies Game;
        }

        processedGamesMap.set(localId, parsedGame);
        gamesMap[parsedGame.id] = parsedGame;
        (rounds[round] ||= []).push(parsedGame.id);
        parsedGame.props.round = game.round;
        parsedGame.props.index = rounds[round].length;
      }

      const processed = processedGamesMap.get(localId)!;

      current.games.push({
        color: processed.players[processed.players[0].id === currentId ? 0 : 1].color,
        game: processed.id,
        won: game.result === '+',
        opponent: opponentId,
        result: processed.result,
        index: opponent?.index ?? 0,
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

  if (event.categories?.length) {
    const top: Record<string, string[][]> = {};

    for (const player of table) {
      if (category) {
        player.categories ||= {};
        player.categories[category] = player.place;
      }

      for (const category of event.categories) {
        const place = Number(player.categories?.[category]);

        if (!isNaN(place) && place <= 3) {
          const categoryTop = (top[category] ||= [[], [], []]);

          categoryTop[place - 1].push(player.id);
        }
      }
    }

    if (category && !top[category]) {
      const categoryTop = (top[category] ||= [[], [], []]);

      for (const player of table) {
        if (player.place <= 3) {
          categoryTop[player.place - 1].push(player.id);
        }
      }
    }

    if (!excluded) {
      const target = (tournamentDetails.categoriesTop ||= {});

      for (const category in top) {
        if (top[category].length && !target[category]) {
          target[category] = top[category];
        }
      }
    }

    // update list of categories used in the tournament
    const list = (tournamentDetails.categories ||= []);
    if (category && !list.includes(category)) {
      list.push(category);
    }

    for (const category of event.categories) {
      if (scoringColumns?.includes(category) && !list.includes(category)) {
        list.push(category);
      }
    }
  } else if (!excluded && !tournamentDetails.top.length) {
    const winners: string[][] = [[], [], []];
    for (const player of table) {
      if (player.place <= 3) {
        winners[player.place - 1].push(player.id);
      } else {
        break;
      }
    }

    tournamentDetails.top = winners;
  }

  if (!tournamentDetails.name) {
    tournamentDetails.name = tournament.name;
  }

  return {
    type: 'tournament',
    name,
    category,
    egd:
      (egd ?? tournament.id)
        ? `https://europeangodatabase.eu/EGD/Tournament_Card.php?&key=${tournament.id}`
        : undefined,
    breakers,
    columns,
    customBreakers,
    rules,
    time: time ?? (tournament.time ? `AT ${tournament.time} min` : undefined),
    komi: komi ?? tournament.komi,
    table,
    rounds,
    notes,
    date: parseDates(date ?? tournament.dates?.join(' - ')),
    promoted,
    placeOffset,
    location: location ?? tournament.location,
    country: country ?? tournament.country,
    excluded,
    collapsed,
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

function parseScore(value?: string): number {
  if (!value) {
    return NaN;
  }

  return Number(value.replace(/[;=S½]$/, '.5'));
}
