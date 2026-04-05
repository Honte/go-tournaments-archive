import EVENT from '@event';
import EVENT_CONFIG from '@event/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Game, Tournament, TournamentDateSpan, TournamentDetails } from '@/schema/data';
import { InputTournament } from '@/schema/input';
import { glob } from 'fast-glob';
import { parse } from 'yaml';
import { createPlayersHandler } from '@/data/players';
import { parseStage } from '@/data/stages';

export async function loadTournaments() {
  const files = await glob(`./events/${EVENT}/data/*.yml`);
  const parsePlayers = createPlayersHandler();
  const tournaments: Tournament[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const json = parse(content) as InputTournament;
    const year = Number(path.parse(file).name);
    const games: Record<string, Game> = {};
    const dates = [];
    const stages = [];

    const players = parsePlayers(json.players);
    const tournamentDetails: TournamentDetails = {
      ...json,
      year,
      country: json.country ?? EVENT_CONFIG.defaultCountry,
      location: json.location ?? '',
      top: json.top ?? [],
    };

    for (const stageJson of json.stages) {
      const stage = await parseStage(stageJson, players, games, tournamentDetails);

      if (stage.date) {
        dates.push(...stage.date);
      }

      stages.push(stage);
    }

    tournaments.push({
      ...tournamentDetails,
      ...getDateRange(dates),
      id: year,
      games,
      players,
      stages,
    });
  }

  return tournaments;
}

function getDateRange(dates: TournamentDateSpan[]) {
  if (!dates.length) {
    return {};
  }

  let start = dates[0].start;
  let end = dates[0].end;

  for (const { start: s, end: e } of dates) {
    if (new Date(s) < new Date(start)) start = s;
    if (new Date(e) > new Date(end)) end = e;
  }

  return { start, end };
}