import { FaMedal } from 'react-icons/fa6';
import { LuCalendarDays, LuExternalLink, LuMapPin } from 'react-icons/lu';
import type { Player, Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { LocalizedString, Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { formatDate, formatRange } from '@/libs/dates';
import { categoryUrl, tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { WinnersGrid } from '@/components/ui/WinnersGrid';

export type WinnersTableProps = {
  previewCount?: number;
  event: EventContext;
  results: (Result | Announcement)[];
  translations: Translations;
};

export type CategoryWinnersTableProps = {
  previewCount?: number;
  event: EventContext;
  tournaments: Tournament[];
  translations: Translations;
};

type EventMetadata = {
  country?: string;
  end?: string;
  location?: string;
  start?: string;
};

type Result = EventMetadata & {
  year: number;
  top: string[][];
  players: Record<string, Player>;
};

type Announcement = EventMetadata & {
  announcement: boolean | LocalizedString;
  website?: string;
  year: number;
};

const MEDALS = [
  { index: 0, color: '#fece43', label: 'winners.first' },
  { index: 1, color: 'silver', label: 'winners.second' },
  { index: 2, color: '#CD7F32', label: 'winners.third' },
] as const;

export function WinnersTable({ event, previewCount, results, translations }: WinnersTableProps) {
  const t = getTranslator(translations);
  const announcements = results.filter((result): result is Announcement => 'announcement' in result);
  const tournaments = results.filter((result): result is Result => !('announcement' in result));

  return (
    <WinnersGrid
      announcements={announcements.map((announcement) => (
        <TournamentAnnouncementRow
          key={announcement.year}
          event={event}
          tournament={announcement}
          translations={translations}
        />
      ))}
      items={tournaments.map((result) => (
        <TournamentMedalistsCard key={result.year} event={event} result={result} translations={translations} />
      ))}
      previewCount={previewCount}
      moreLabel={
        previewCount === undefined ? '' : t('winners.showMoreTournaments', String(tournaments.length - previewCount))
      }
      lessLabel={t('actions.showLess')}
    />
  );
}

export function CategoryWinnersTable({ event, previewCount, tournaments, translations }: CategoryWinnersTableProps) {
  const t = getTranslator(translations);
  const announcements = tournaments.filter((tournament) => tournament.announcement);
  const results = tournaments.filter((tournament) => !tournament.announcement);

  return (
    <WinnersGrid
      announcements={announcements.map((tournament) => (
        <TournamentAnnouncementRow
          key={tournament.id}
          event={event}
          tournament={{
            announcement: tournament.announcement!,
            country: tournament.country,
            end: tournament.end,
            location: tournament.location,
            start: tournament.start,
            website: Array.isArray(tournament.website) ? tournament.website[0] : tournament.website,
            year: tournament.year,
          }}
          translations={translations}
        />
      ))}
      items={results.map((tournament) => (
        <CategoryTournamentMedalistsCard
          key={tournament.id}
          event={event}
          tournament={tournament}
          translations={translations}
        />
      ))}
      previewCount={previewCount}
      moreLabel={
        previewCount === undefined ? '' : t('winners.showMoreTournaments', String(results.length - previewCount))
      }
      lessLabel={t('actions.showLess')}
    />
  );
}

function TournamentMedalistsCard({
  event,
  result,
  translations,
}: {
  event: EventContext;
  result: Result;
  translations: Translations;
}) {
  const { year, top, players } = result;
  const t = getTranslator(translations);

  return (
    <article className="overflow-hidden rounded-xl border border-archive-border bg-archive-surface shadow-sm transition-shadow hover:shadow-md">
      <EventHeading
        event={event}
        year={year}
        location={getLocation(result, t, event.showCountry)}
        date={getDate(result, translations.locale)}
        translations={translations}
      />
      <MedalRows event={event} players={players} top={top} translations={translations} />
    </article>
  );
}

function CategoryTournamentMedalistsCard({
  event,
  tournament,
  translations,
}: {
  event: EventContext;
  tournament: Tournament;
  translations: Translations;
}) {
  const t = getTranslator(translations);
  const categories = event.categories?.filter((category) => tournament.categoriesTop?.[category]) ?? [];

  return (
    <article className="overflow-hidden rounded-xl border border-archive-border bg-archive-surface shadow-sm transition-shadow hover:shadow-md">
      <EventHeading
        event={event}
        year={tournament.year}
        location={getLocation(tournament, t, event.showCountry)}
        date={getDate(tournament, translations.locale)}
        translations={translations}
      />
      <div className="min-w-0 divide-y divide-archive-border">
        {categories.map((category) => (
          <section className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)]" key={category}>
            <Link
              href={categoryUrl(event, translations.locale, category)}
              className="flex items-center justify-center border-r border-archive-border bg-archive-surface-tint px-2 py-3 text-center text-xs font-bold tracking-wide text-archive-text no-underline transition-colors hover:text-archive-link-hover focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-archive-focus-ring"
              style={{ textDecoration: 'none' }}
              aria-label={t(`categories.full.${category}`)}
            >
              <span className="rotate-180 whitespace-nowrap [text-orientation:mixed] [writing-mode:vertical-rl]">
                {t(`categories.full.${category}`)}
              </span>
            </Link>
            <MedalRows
              event={event}
              players={tournament.players}
              top={tournament.categoriesTop?.[category] ?? []}
              translations={translations}
            />
          </section>
        ))}
      </div>
    </article>
  );
}

function MedalRows({
  event,
  players,
  top,
  translations,
}: {
  event: EventContext;
  players: Record<string, Player>;
  top: string[][];
  translations: Translations;
}) {
  const t = getTranslator(translations);

  return (
    <div className="min-w-0 divide-y divide-archive-border">
      {MEDALS.map(({ index, color, label }) => (
        <section className="flex min-w-0 items-start gap-2 px-3 py-3 sm:px-4" key={index}>
          <FaMedal className="mt-2 shrink-0" color={color} aria-label={t(label)} title={t(label)} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {top[index]?.length ? (
              top[index].map((id) => (
                <PlayerLink
                  key={id}
                  className="block min-w-0 rounded-md px-1.5 py-1 text-current transition-colors hover:bg-archive-surface-hover-accent hover:text-archive-link"
                  event={event}
                  style={{ textDecoration: 'none' }}
                  playerId={players[id].id}
                  locale={translations.locale}
                >
                  <span className="min-w-0 wrap-break-word hyphens-auto">
                    <PlayerName player={players[id]} showCountry={event.showCountry} />
                  </span>
                </PlayerLink>
              ))
            ) : (
              <span className="px-1.5 py-1">-</span>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function TournamentAnnouncementRow({
  event,
  tournament,
  translations,
}: {
  event: EventContext;
  tournament: Announcement;
  translations: Translations;
}) {
  const { announcement, year, website } = tournament;
  const t = getTranslator(translations);
  const content =
    (typeof announcement === 'object'
      ? announcement[translations.locale]
      : typeof announcement === 'string'
        ? announcement
        : undefined) ?? t('site.eventName');

  return (
    <div className="group grid grid-cols-[auto_minmax(0,1fr)] items-stretch overflow-hidden rounded-xl border border-archive-accent-fill bg-archive-accent-fill text-archive-accent-text shadow-sm transition-colors duration-500 hover:bg-archive-accent-fill-hover hover:text-archive-accent-text">
      <Link
        href={tournamentUrl(event, translations.locale, year)}
        className="flex items-center px-4 py-3 text-xl font-bold text-current no-underline hover:text-current sm:text-2xl"
      >
        {year}
      </Link>
      <div className="flex min-w-0 items-center justify-center px-4 py-3 text-center font-semibold">
        {website ? (
          <a
            href={website}
            className="flex min-w-0 cursor-pointer items-center justify-center gap-2 underline-offset-2 hover:underline"
          >
            {content}
            <LuExternalLink className="shrink-0" aria-hidden="true" />
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function EventHeading({
  event,
  year,
  location,
  date,
  translations,
}: {
  event: EventContext;
  year: number;
  location: string;
  date?: string;
  translations: Translations;
}) {
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
