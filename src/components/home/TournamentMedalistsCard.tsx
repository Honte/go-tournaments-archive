import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { MedalRows } from '@/components/home/MedalRows';
import { TournamentCardHeading } from '@/components/home/TournamentCardHeading';
import type { Result } from './types';

type TournamentMedalistsCardProps = {
  event: EventContext;
  result: Result;
  translations: Translations;
};

export function TournamentMedalistsCard({ event, result, translations }: TournamentMedalistsCardProps) {
  const { top, players } = result;

  return (
    <article className="overflow-hidden rounded-xl border border-archive-border bg-archive-surface shadow-sm transition-shadow hover:shadow-md">
      <TournamentCardHeading event={event} tournament={result} translations={translations} />
      <MedalRows event={event} players={players} top={top} translations={translations} />
    </article>
  );
}
