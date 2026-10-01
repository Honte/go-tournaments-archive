import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Game, GamePlayer, LeagueStage, TableResult } from '@/schema/data';
import type { InputTournamentStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import { JIGO } from '@/libs/games';
import { buildLocalGameId, type H9Game, type H9Player, parseH9 } from '@/libs/h9';
import { validatePairs } from '@/libs/participants';
import { getRankValue } from '@/libs/rank';
import { getGameId, parseGame } from '@/data/games';
import { loadH9Participant } from '@/data/participants';
import type { ParseStageProps } from '@/data/stages';

type H9TournamentProps = Omit<ParseStageProps, 'stage'> & { stage: InputTournamentStage };

export async function loadH9Tournament(props: H9TournamentProps): Promise<LeagueStage> {
  const file = join('./events', props.event.id, 'data', props.stage.file);
  try {
    return parseH9Tournament(props, await readFile(file, 'utf-8'));
  } catch (cause) {
    throw new Error(`${file}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
  }
}

export function parseH9Tournament(tournamentProps: H9TournamentProps, h9content: string): LeagueStage {
  const { event, stage, stageIndex, gamesMap, tournamentDetails } = tournamentProps;
  const {
    name,
    breakers,
    columns,
    rules,
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

  const tournament = parseH9(h9content, event.pairs);
  const table = createTournamentTable(tournament.results, tournamentProps);
  const processedGamesMap = new Map<string, Game>();
  const existingGamesMap = loadGameOverrides(games ?? [], table, gamesMap, stageIndex);
  const tournamentPlaceMap = new Map(table.map((row) => [row.place, row]));
  const rounds: string[][] = [];

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
      } else if (game.result === '=') {
        current.drawn.push(opponentId);
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

          const result = getGameResult(game.result, game.color);

          parsedGame = {
            id: getGameId(gamesMap),
            stage: stageIndex,
            players: [isCurrentBlack ? playerA : playerB, isCurrentBlack ? playerB : playerA],
            result,
            draw: result === JIGO,
            unresolved: result === '?',
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
        drawn: game.result === '=',
        unresolved: processed.result === '?',
        opponent: opponentId,
        result: processed.result,
        index: opponent?.index ?? 0,
      });
    }
  }

  for (const round of rounds) {
    round.sort(compareSgfGames);
  }

  applySharedPlaces(table, stage);
  updateTournamentPodiums(table, tournamentProps);

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

  function compareSgfGames(a: string, b: string): number {
    const gameA = gamesMap[a]!;
    const gameB = gamesMap[b]!;

    if ((gameA.props.sgf && gameB.props.sgf) || gameA.props.sgf === gameB.props.sgf) {
      return 0;
    }
    return gameA.props.sgf ? -1 : 1;
  }
}

function createTournamentTable(results: H9Player[], props: H9TournamentProps): TableResult[] {
  const {
    event,
    stage: { scoringColumns },
    playersMap,
  } = props;
  const table: TableResult[] = [];
  for (const player of results) {
    const participant = loadTournamentParticipant(player, props);
    const tableEntry: TableResult = {
      id: participant.id,
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
      drawn: [],
      lost: [],
      games: [],
    };

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

  if (event.pairs && !results.length) {
    validatePairs(playersMap);
  }

  return table;
}

function loadGameOverrides(
  games: string[],
  table: TableResult[],
  gamesMap: Record<string, Game>,
  stageIndex: number
): Map<string, Game> {
  const existingGamesMap = new Map<string, Game>();
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

  return existingGamesMap;
}

function applySharedPlaces(
  table: TableResult[],
  { findSharedPlaces, breakers, sharedPlaces }: InputTournamentStage
): void {
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
}

function updateTournamentPodiums(table: TableResult[], { event, stage, tournamentDetails }: H9TournamentProps): void {
  const { category, excluded, scoringColumns } = stage;
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
}

function loadTournamentParticipant(player: H9Player, { event, playersMap, playersHandler }: H9TournamentProps) {
  try {
    const participant = loadH9Participant(player, event, playersHandler);
    playersMap[participant.id] = participant;
    if (event.pairs) {
      validatePairs(playersMap);
    }
    return participant;
  } catch (cause) {
    throw new Error(`H9 line ${player.line ?? '?'}: ${cause instanceof Error ? cause.message : String(cause)}`, {
      cause,
    });
  }
}

function getGameResult(result: H9Game['result'], color: H9Game['color']) {
  switch (result) {
    case '+':
      return color ? (color === 'black' ? 'B+' : 'W+') : '+';
    case '-':
      return color ? (color === 'black' ? 'W+' : 'B+') : '+';
    case '=':
      return JIGO;
    case '?':
      return '?';
  }
}

function parseScore(value?: string): number {
  if (!value) {
    return NaN;
  }

  return Number(value.replace(/[;=S½]$/, '.5'));
}
