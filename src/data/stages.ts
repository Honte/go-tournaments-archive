import { Game, LeagueStage, Player, Stage, TournamentDetails } from '@/schema/data';
import type { EventConfig } from '@/schema/event';
import { type InputStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import { loadClassificationStage } from '@/data/classification';
import { createFinalTable } from '@/data/final';
import { parseGames } from '@/data/games';
import { loadH9Tournament } from '@/data/h9tournament';
import { PlayersHandler } from '@/data/players';
import { createTable } from '@/data/table';
import { createLadderTable } from '@/data/tableLadder';
import { createTableWithoutRounds } from '@/data/tableWithoutRounds';

export type ParseStageProps = {
  event: EventConfig;
  stage: InputStage;
  stageIndex: number;
  playersMap: Record<string, Player>;
  playersHandler: PlayersHandler;
  gamesMap: Record<string, Game>;
  tournamentDetails: TournamentDetails;
};

export async function parseStage({
  event,
  stage,
  stageIndex,
  playersMap,
  gamesMap,
  tournamentDetails,
  playersHandler,
}: ParseStageProps): Promise<Stage> {
  const date = stage.date ? parseDates(stage.date) : undefined;

  switch (stage.type) {
    case 'tournament':
      return loadH9Tournament({
        event,
        stage,
        stageIndex,
        playersMap,
        playersHandler,
        gamesMap,
        tournamentDetails,
      });
    case 'classification':
      return loadClassificationStage({
        stage,
        playersMap,
        playersHandler,
        tournamentDetails,
      });
    case 'league': {
      const rounds = stage.rounds.map((round, index) => parseGames(gamesMap, round, stageIndex, index + 1));

      return {
        ...stage,
        date,
        rounds,
        table: createTable({
          rounds,
          gamesMap,
          playersMap,
          order: stage.order,
          breakers: stage.breakers,
        }),
      } satisfies LeagueStage;
    }
    case 'ladder-table': {
      const rounds = stage.rounds.map((round, index) => parseGames(gamesMap, round, stageIndex, index + 1));
      const playoffs = stage.playoffs ? parseGames(gamesMap, stage.playoffs, stageIndex) : [];

      return {
        ...stage,
        date,
        rounds,
        playoffs,
        table: createLadderTable({
          rounds,
          playoffs,
          gamesMap,
          order: stage.order,
        }),
      };
    }
    case 'final': {
      const games = parseGames(gamesMap, stage.games, stageIndex);

      return {
        ...stage,
        date,
        games,
        table: createFinalTable({
          games,
          gamesMap,
          includePrevious: stage.includePrevious ?? false,
        }),
      };
    }
    case 'round-robin-table': {
      const games = parseGames(gamesMap, stage.games, stageIndex);

      return {
        ...stage,
        date,
        games,
        table: createTableWithoutRounds({
          games,
          gamesMap,
          playersMap,
        }),
      };
    }
    default:
      // @ts-ignore
      throw new Error(`Unrecognized stage ${stage.type}`);
  }
}
