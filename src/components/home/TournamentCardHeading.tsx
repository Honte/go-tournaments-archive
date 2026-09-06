import { LuCalendarDays, LuMapPin } from 'react-icons/lu';
import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { translate } from '@/i18n/translator';
import { formatDate, formatRange } from '@/libs/dates';
import { tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

type TournamentCardHeadingProps = {
  event: EventContext;
  tournament: Tournament;
  translations: Translations;
};

export function TournamentCardHeading({ event, tournament, translations }: TournamentCardHeadingProps) {
  const { year } = tournament;

  return (
    <Link
      href={tournamentUrl(event, translations.locale, year)}
      className="group block text-current no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-focus-ring"
    >
      <header className="flex items-center gap-x-4 border-b border-archive-border bg-archive-surface-muted p-3 transition-colors group-hover:bg-archive-surface-hover-accent sm:px-4">
        <span className="shrink-0 text-xl font-bold transition-colors group-hover:text-archive-link-hover sm:text-2xl">
          {year}
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-xs text-current/75 sm:text-sm">
          <LocationRenderer event={event} tournament={tournament} translations={translations} />
          <DateRenderer event={event} tournament={tournament} translations={translations} />
        </div>
      </header>
    </Link>
  );
}

function LocationRenderer({ event, tournament, translations }: TournamentCardHeadingProps) {
  if (!tournament.location) {
    return null;
  }

  const location =
    [
      tournament.location,
      event.showCountry && tournament.country ? translate(translations, `country.${tournament.country}`) : undefined,
    ]
      .filter(Boolean)
      .join(', ') || undefined;

  return (
    <span className="flex min-w-0 items-center justify-end gap-1.5">
      <LuMapPin className="shrink-0" aria-hidden="true" />
      <span className="truncate text-right" title={location}>
        {location}
      </span>
    </span>
  );
}

function DateRenderer({ tournament, translations }: TournamentCardHeadingProps) {
  if (!tournament.start && !tournament.end) {
    return null;
  }

  const date =
    tournament.start && tournament.end
      ? formatRange(tournament.start, tournament.end, translations.locale)
      : formatDate(tournament.start ?? tournament.end!, translations.locale);

  return (
    <span className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
      <LuCalendarDays className="shrink-0" aria-hidden="true" />
      <span className="truncate text-right" title={date}>
        {date}
      </span>
    </span>
  );
}
