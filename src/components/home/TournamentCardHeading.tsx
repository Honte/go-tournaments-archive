import { LuCalendarDays, LuMapPin } from 'react-icons/lu';
import type { EventContext } from '@/schema/event';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { formatDate, formatRange } from '@/libs/dates';
import { tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import type { EventMetadata } from './types';

type TournamentCardHeadingProps = {
  event: EventContext;
  tournament: EventMetadata & { year: number };
  translations: Translations;
};

export function TournamentCardHeading({ event, tournament, translations }: TournamentCardHeadingProps) {
  const t = getTranslator(translations);
  const { year } = tournament;
  const location = getLocation(tournament, t, event.showCountry);
  const date = getDate(tournament, translations.locale);

  return (
    <Link
      href={tournamentUrl(event, translations.locale, year)}
      className="group block text-current no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-focus-ring"
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 border-b border-archive-border bg-archive-surface-muted px-3 py-3 transition-colors group-hover:bg-archive-surface-hover-accent sm:px-4">
        <span className="text-xl font-bold transition-colors group-hover:text-archive-link-hover sm:text-2xl">
          {year}
        </span>
        <div className="flex min-w-0 flex-col items-end gap-1 text-xs text-current/75 sm:text-sm">
          <span className="flex min-w-0 items-center justify-end gap-1.5">
            <LuMapPin className="shrink-0" aria-hidden="true" />
            <span className="truncate text-right" title={location}>
              {location}
            </span>
          </span>
          {date && (
            <span className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
              <LuCalendarDays className="shrink-0" aria-hidden="true" />
              <span className="truncate text-right" title={date}>
                {date}
              </span>
            </span>
          )}
        </div>
      </header>
    </Link>
  );
}

function getLocation(event: EventMetadata, t: Translator, showCountry?: boolean) {
  const country = showCountry && event.country ? t(`country.${event.country}`) : undefined;

  return [event.location, country].filter(Boolean).join(', ') || t('winners.locationUnknown');
}

function getDate(event: EventMetadata, locale: string) {
  if (event.start && event.end) {
    return formatRange(event.start, event.end, locale);
  }

  const date = event.start ?? event.end;

  return date ? formatDate(date, locale) : undefined;
}
