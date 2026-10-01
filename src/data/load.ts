import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { LineCounter, parseDocument, isNode } from 'yaml';
import type { Game, Participant, Tournament, TournamentDateSpan, TournamentDetails } from '@/schema/data';
import type { EventContext, EventData } from '@/schema/event';
import type { InputTournament } from '@/schema/input';
import { normalizePlayerName } from '@/libs/h9';
import { getParticipantName, getParticipantPlayers, isPair } from '@/libs/participants';
import { parseTop } from '@/libs/stage';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { loadParticipants } from '@/data/participants';
import { createPlayersHandler, type PlayersHandler } from '@/data/players';
import { parseStage } from '@/data/stages';
import { calculateStats } from '@/data/stats';

export async function loadData(event: EventContext): Promise<EventData> {
  const files = await fg.glob(`./events/${event.id}/data/*.yml`);
  const playersHandler = createPlayersHandler(await readEventPlayersFile(event.id));
  const tournaments: Tournament[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    tournaments.push(await parseTournament(content, file, event, playersHandler));
  }

  tournaments.sort((a, b) => a.year - b.year);

  const stats = calculateStats(event, tournaments, playersHandler);

  // decorate every player entry with `hasStats` flag
  for (const tournament of tournaments) {
    for (const participant of Object.values(tournament.participants)) {
      for (const player of getParticipantPlayers(participant)) {
        player.hasStats = player.id in stats.players;
      }
    }
  }

  const playersSummaries = Object.values(stats.players).map((player) => ({
    ...player,
    results: undefined,
    opponents: undefined,
  }));

  const countriesSummaries = Object.values(stats.countries).map((country) => ({
    ...country,
    years: undefined,
  }));

  return {
    tournaments,
    stats,
    summary: {
      attendants: playersSummaries.sort((a, b) => b.totalAttended - a.totalAttended).slice(0, 10),
      medalists: playersSummaries.filter((player) => player.score > 0).sort((a, b) => b.score - a.score),
      countryMedals: countriesSummaries.filter((country) => country.score > 0).sort((a, b) => b.score - a.score),
      totalStats: stats.summary,
    },
  };
}

export async function parseTournament(
  content: string,
  file: string,
  event: EventContext,
  playersHandler: PlayersHandler
): Promise<Tournament> {
  const lineCounter = new LineCounter();
  const document = parseDocument(content, { lineCounter });
  if (document.errors.length) {
    throw new Error(`${file}: ${document.errors[0].message}`);
  }
  const json = document.toJS() as InputTournament;
  const year = Number(path.parse(file).name);
  const games: Record<string, Game> = {};
  const dates = [];
  const stages = [];

  const participants = loadParticipants(json.players, event, playersHandler, (id) => describeSource(['players', id]));
  const tournamentDetails: TournamentDetails = {
    ...json,
    year,
    country: json.country,
    location: json.location ?? '',
    categories: json.categories ?? [],
    top: parseTop(json.top),
  };

  const stageCountries = new Set<string>();
  const stageLocations = new Set<string>();

  if (json.stages?.length) {
    for (const [stageIndex, stageJson] of json.stages.entries()) {
      try {
        const stage = await parseStage({
          event,
          stage: stageJson,
          stageIndex,
          playersMap: participants,
          gamesMap: games,
          tournamentDetails,
          playersHandler,
        });

        if (stage.date) {
          dates.push(...stage.date);
        }

        stages.push(stage);

        if (stage.country) {
          stageCountries.add(stage.country);
        }

        if (stage.location) {
          stageLocations.add(stage.location);
        }
      } catch (e) {
        throw new Error(
          `Error parsing tournament: ${describeSource(['stages', stageIndex])}: ${e instanceof Error ? e.message : String(e)}`,
          {
            cause: e,
          }
        );
      }
    }
  }

  const participantIds = createParticipantIdMap(participants);

  if (tournamentDetails.top) {
    tournamentDetails.top = resolvePodiumIds(tournamentDetails.top, participantIds, event.pairs ? file : undefined);
  }

  if (tournamentDetails.categoriesTop) {
    for (const category in tournamentDetails.categoriesTop) {
      tournamentDetails.categoriesTop[category] = resolvePodiumIds(
        tournamentDetails.categoriesTop[category],
        participantIds,
        event.pairs ? file : undefined
      );
    }
  }

  if (!tournamentDetails.country) {
    tournamentDetails.country = stageCountries.size === 1 ? stageCountries.values().next().value : undefined;
  }

  if (!tournamentDetails.location) {
    tournamentDetails.location = Array.from(stageLocations).join(', ');
  }

  for (const game of Object.values(games)) {
    if (game.props.sgf) {
      game.path = `./events/${event.id}/sgf/${game.props.sgf}`;

      if (event.generatePngs) {
        game.props.png = game.props.sgf.replace('.sgf', '.png');
      }

      if (event.generateSvgs) {
        game.props.svg = game.props.sgf.replace('.sgf', '.svg');
      }

      if (event.generateJpgs) {
        game.props.jpg = game.props.sgf.replace('.sgf', '.jpg');
      }
    }
  }

  return {
    ...tournamentDetails,
    ...getDateRange(dates),
    id: year,
    games,
    participants: event.pairs
      ? Object.fromEntries(Object.values(participants).map((participant) => [participant.id, participant]))
      : participants,
    stages,
    hasSgfs: Object.values(games).some((game) => game.props?.sgf),
  };

  function describeSource(key: (string | number)[]): string {
    const node = document.getIn(key, true);
    const line = isNode(node) && node.range ? lineCounter.linePos(node.range[0]).line : 1;
    return `${file}:${line}`;
  }
}

function getDateRange(dates: TournamentDateSpan[]) {
  if (!dates.length) {
    return {};
  }

  let start = dates[0].start;
  let end = dates[0].end;

  for (const { start: s, end: e } of dates) {
    if (new Date(s) < new Date(start)) {
      start = s;
    }

    if (new Date(e) > new Date(end)) {
      end = e;
    }
  }

  return { start, end };
}

function resolvePodiumIds(top: string[][], idsMap: Record<string, string>, source?: string): string[][] {
  const podium: string[][] = [];
  for (const place of top) {
    const ids: string[] = [];
    for (const nameOrId of place) {
      const id = nameOrId ? idsMap[normalizePlayerName(nameOrId)] : undefined;
      if (source && nameOrId && !id) {
        throw new Error(`${source}: unknown pair in podium: ${nameOrId}`);
      }
      if (id) {
        ids.push(id);
      }
    }
    podium.push(ids);
  }
  return podium;
}

function createParticipantIdMap(participants: Record<string, Participant>) {
  const idsMap: Record<string, string> = {};

  for (const [id, participant] of Object.entries(participants)) {
    const participantId = isPair(participant) ? participant.id : id;
    idsMap[id] = participantId;
    idsMap[getParticipantName(participant)] = participantId;

    if (!isPair(participant) && participant.egd) {
      idsMap[participant.egd] = id;
    }
  }

  return idsMap;
}
