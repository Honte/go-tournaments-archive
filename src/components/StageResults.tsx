import type { Game, Player, Stage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { StageFinal } from '@/components/StageFinal';
import { ClassificationTable } from '@/components/table/ClassificationTable';
import { TableLadder } from '@/components/table/TableLadder';
import { TableLeague } from '@/components/table/TableLeague';
import { TableWithoutRounds } from '@/components/table/TableWithoutRounds';

type StageResultsProps = {
  event: EventContext;
  stage: Stage;
  games: Record<string, Game>;
  players: Record<string, Player>;
  translations: Translations;
};

export function StageResults({ event, stage, games, players, translations }: StageResultsProps) {
  switch (stage.type) {
    case 'tournament':
    case 'league':
      return <TableLeague event={event} stage={stage} players={players} translations={translations} games={games} />;
    case 'ladder-table':
      return <TableLadder event={event} stage={stage} players={players} translations={translations} games={games} />;
    case 'final':
      return <StageFinal event={event} stage={stage} translations={translations} players={players} />;
    case 'round-robin-table':
      return (
        <TableWithoutRounds event={event} stage={stage} players={players} translations={translations} games={games} />
      );
    case 'classification':
      return <ClassificationTable event={event} stage={stage} players={players} translations={translations} />;
    default:
      throw new Error('Unrecognized stage type');
  }
}
