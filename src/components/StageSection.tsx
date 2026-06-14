import { FaChevronRight } from 'react-icons/fa6';
import type { Game, Player, Stage } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getStageName } from '@/libs/stage';
import { StageDetails } from '@/components/StageDetails';
import { StageResults } from '@/components/StageResults';
import { H2 } from '@/components/ui/H2';

type StageSectionProps = {
  event: EventContext;
  stage: Stage;
  games: Record<string, Game>;
  players: Record<string, Player>;
  translations: Translations;
};

export function StageSection({ event, stage, games, players, translations }: StageSectionProps) {
  return (
    <details open={!stage.collapsed} className="group my-4">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <H2 className="flex items-center gap-2">
          <FaChevronRight
            aria-hidden
            className="shrink-0 text-base transition-transform duration-200 group-open:rotate-90"
          />
          <span>{getStageName(stage, translations)}</span>
        </H2>
      </summary>
      <StageDetails event={event} stage={stage} translations={translations} />
      <StageResults event={event} stage={stage} games={games} players={players} translations={translations} />
    </details>
  );
}
