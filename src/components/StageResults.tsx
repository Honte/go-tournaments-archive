import type { Game, Player, Stage } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { StageFinal } from '@/components/StageFinal';
import { TableLadder } from '@/components/table/TableLadder';
import { TableLeague } from '@/components/table/TableLeague';
import { TableWithoutRounds } from '@/components/table/TableWithoutRounds';

type StageResultsProps = {
  stage: Stage;
  games: Record<string, Game>;
  players: Record<string, Player>;
  translations: Translations;
};

export function StageResults({ stage, games, players, translations }: StageResultsProps) {
  switch (stage.type) {
    case 'league':
      return <TableLeague stage={stage} players={players} translations={translations} games={games} />;
    case 'ladder-table':
      return <TableLadder stage={stage} players={players} translations={translations} games={games} />;
    case 'final':
      return <StageFinal stage={stage} translations={translations} players={players} />;
    case 'round-robin-table':
      return <TableWithoutRounds stage={stage} players={players} translations={translations} games={games} />;
    default:
      throw new Error('Unrecognized stage type');
  }
}
