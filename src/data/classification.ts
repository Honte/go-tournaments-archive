import { type ClassificationStage, Player, TournamentDetails } from '@/schema/data';
import { type InputClassificationStage } from '@/schema/input';
import { parseDates } from '@/libs/dates';
import type { PlayersHandler } from '@/data/players';

export function loadClassificationStage({
  stage,
  playersMap,
  playersHandler,
  tournamentDetails,
}: {
  stage: InputClassificationStage;
  playersMap: Record<string, Player>;
  playersHandler: PlayersHandler;
  tournamentDetails: TournamentDetails;
}): ClassificationStage {
  const table: ClassificationStage['table'] = [];
  let index = 0;
  for (const order of stage.order) {
    const place = index + 1;

    for (const playerRow of Array.isArray(order) ? order : [order]) {
      let player = playersMap[playerRow];

      if (!player) {
        player = playersHandler.loadPlayer(playerRow);
        playersMap[player.id] = player;
      }

      table.push({
        id: player.id,
        index: index++,
        place,
      });
    }
  }

  if (!stage.excluded && !tournamentDetails.top.length) {
    const winners: string[][] = [];
    for (const player of table) {
      if (player.place <= 3) {
        (winners[player.place - 1] ||= []).push(player.id);
      } else {
        break;
      }
    }

    tournamentDetails.top = winners;
  }

  return {
    ...stage,
    date: stage.date ? parseDates(stage.date) : undefined,
    table,
  };
}
