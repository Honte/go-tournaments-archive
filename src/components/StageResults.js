import { StageFinal } from '@/components/StageFinal';
import { TableLeague } from '@/components/table/TableLeague';
import { TableLadder } from '@/components/table/TableLadder';
import { TableWithoutRounds } from '@/components/table/TableWithoutRounds';

export function StageResults({ stage, games, players, translations }) {
  switch (stage.type) {
    case 'league':
      return <TableLeague stage={stage} players={players} translations={translations} games={games} />;
    case 'ladder-table':
      return <TableLadder stage={stage} players={players} translations={translations} games={games} />;
    case 'final':
      return <StageFinal stage={stage} translations={translations} games={games} players={players} />;
    case 'round-robin-table':
      return <TableWithoutRounds stage={stage} players={players} translations={translations} games={games} />;
    default:
      throw new Error('Unrecognized stage type');
  }
}
