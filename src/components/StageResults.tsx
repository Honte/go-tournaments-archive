import type { Game, Player, Stage } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { StageFinal } from '@/components/StageFinal';
import { ClassificationTable } from '@/components/table/ClassificationTable';
import { TableLadder } from '@/components/table/TableLadder';
import { TableLeague } from '@/components/table/TableLeague';
import { TableWithoutRounds } from '@/components/table/TableWithoutRounds';

type StageResultsProps = {
  stage: Stage;
  games: Record<string, Game>;
  players: Record<string, Player>;
  translations: Translations;
  showCountry?: boolean;
};

export function StageResults({ stage, games, players, translations, showCountry }: StageResultsProps) {
  switch (stage.type) {
    case 'tournament':
    case 'league':
      return (
        <TableLeague
          stage={stage}
          players={players}
          translations={translations}
          games={games}
          showCountry={showCountry}
        />
      );
    case 'ladder-table':
      return <TableLadder stage={stage} players={players} translations={translations} games={games} />;
    case 'final':
      return <StageFinal stage={stage} translations={translations} players={players} showCountry={showCountry} />;
    case 'round-robin-table':
      return <TableWithoutRounds stage={stage} players={players} translations={translations} games={games} />;
    case 'classification':
      return (
        <ClassificationTable stage={stage} players={players} translations={translations} showCountry={showCountry} />
      );
    default:
      throw new Error('Unrecognized stage type');
  }
}
