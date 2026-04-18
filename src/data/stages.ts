import { Game, LeagueStage, Player, Stage, TournamentDetails } from '@/schema/data';
import { InputStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import { createFinalTable } from '@/data/final';
import { parseGames } from '@/data/games';
import { loadH9Tournament } from '@/data/h9tournament';
import { PlayersHandler } from '@/data/players';
import { createTable } from '@/data/table';
import { createLadderTable } from '@/data/tableLadder';
import { createTableWithoutRounds } from '@/data/tableWithoutRounds';

export async function parseStage(
  stage: InputStage,
  playersMap: Record<string, Player>,
  gamesMap: Record<string, Game>,
  tournamentDetails: TournamentDetails,
  playersHandler: PlayersHandler
): Promise<Stage> {
  const date = parseDates(stage.date);

  switch (stage.type) {
    case 'tournament':
      return loadH9Tournament({
        stage,
        playersMap,
        playersHandler,
        gamesMap,
        tournamentDetails,
      });
    case 'league': {
      const rounds = stage.rounds.map((round, index) => parseGames(gamesMap, round, index + 1));

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
      const rounds = stage.rounds.map((round, index) => parseGames(gamesMap, round, index + 1));
      const playoffs = stage.playoffs ? parseGames(gamesMap, stage.playoffs) : [];

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
      const games = parseGames(gamesMap, stage.games);

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
      const games = parseGames(gamesMap, stage.games);

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
