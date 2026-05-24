import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { InputStage, InputTournament, InputTournamentStage } from '@/schema/input';
import { parseH9 } from '@/libs/h9';
import { parseEntry } from './entries';
import { processExplicitStage } from './explicit';
import { matchSgfs } from './match';
import { loadSgfInfos } from './sgf';
import { buildGamesMap, buildPlayersMap } from './tournament';
import type { ParsedGameEntry, StageProcessResult } from './types';

type StageProcessInput = {
  tournament: InputTournament;
  stage: InputStage;
  sgfPaths: string[];
  dataDir: string;
  sgfDir: string;
  force: boolean;
  strict: boolean;
};

export async function processStage(input: StageProcessInput): Promise<StageProcessResult> {
  switch (input.stage.type) {
    case 'tournament':
      return processH9TournamentStage({ ...input, stage: input.stage });
    case 'league':
    case 'ladder-table':
    case 'round-robin-table':
    case 'final':
      return processExplicitStage({ ...input, stage: input.stage });
  }
}

async function processH9TournamentStage({
  stage,
  sgfPaths,
  sgfDir,
  dataDir,
  force,
  strict,
}: StageProcessInput & { stage: InputTournamentStage }): Promise<StageProcessResult> {
  const tournamentFilePath = path.join(dataDir, stage.file);
  const tournamentFileContent = await readFile(tournamentFilePath, 'utf-8');
  const tournament = parseH9(tournamentFileContent);

  const playersMap = buildPlayersMap(tournament.results);
  const gamesMap = buildGamesMap(tournament.results);

  const existingGamesById = new Map<string, ParsedGameEntry>();
  const existingGamesBySgf = new Map<string, ParsedGameEntry>();
  const previousEntries: string[] = [];

  if (Array.isArray(stage.games)) {
    for (const entry of stage.games) {
      const result = parseEntry(entry);

      if (!result) {
        continue;
      }

      existingGamesById.set(result.id, result);
      existingGamesBySgf.set(result.sgf, result);
      previousEntries.push(entry);
    }
  }

  const pathsToMatch = force ? sgfPaths : sgfPaths.filter((p) => !existingGamesBySgf.has(p));
  const sgfInfos = await loadSgfInfos(sgfDir, pathsToMatch, strict);

  const { matchedEntries, matchedSgfs, unmatchedSgfs, unmatchedEntries } = matchSgfs(
    sgfInfos,
    playersMap,
    gamesMap,
    existingGamesById,
    existingGamesBySgf,
    force
  );

  return {
    previousEntries,
    reusedEntries: force ? [] : previousEntries,
    matchedEntries,
    unmatchedEntries,
    totalSgfs: sgfPaths.length,
    claimedSgfs: [...new Set([...existingGamesBySgf.keys(), ...matchedSgfs, ...unmatchedSgfs.map((sgf) => sgf.path)])],
  };
}
