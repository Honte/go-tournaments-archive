import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { InputTournamentStage } from '@/schema/input';
import { parseH9 } from '@/libs/h9';
import { parseEntry } from './entries';
import { matchSgfs } from './match';
import { buildUnmatchedEntries } from './report';
import { loadSgfInfos } from './sgf';
import { buildGamesMap, buildPlayersMap } from './tournament';
import type { ParsedGameEntry, StageProcessResult } from './types';

export async function processStage(
  stage: InputTournamentStage,
  sgfPaths: string[],
  rootDir: string,
  force: boolean
): Promise<StageProcessResult> {
  const tournamentFilePath = path.join(rootDir, stage.file);
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
  const sgfInfos = await loadSgfInfos(rootDir, pathsToMatch);

  const { matchedEntries, unmatchedSgfs } = matchSgfs(sgfInfos, playersMap, gamesMap, existingGamesById, force);

  const unmatchedEntries = buildUnmatchedEntries(unmatchedSgfs, playersMap, existingGamesBySgf);

  return {
    previousEntries,
    reusedEntries: force ? [] : previousEntries,
    matchedEntries,
    unmatchedEntries,
    totalSgfs: sgfPaths.length,
  };
}
