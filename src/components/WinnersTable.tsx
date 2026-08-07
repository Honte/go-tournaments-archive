import { LuExternalLink } from 'react-icons/lu';
import type { Player } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { LocalizedString, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

export type WinnersTableProps = {
  event: EventContext;
  results: (Result | Announcement)[];
  translations: Translations;
};

type Result = {
  year: number;
  top: string[][];
  players: Record<string, Player>;
};

type Announcement = {
  announcement: boolean | LocalizedString;
  website?: string;
  year: number;
};

const MEDALS = [0, 1, 2];

export function WinnersTable({ event, results, translations }: WinnersTableProps) {
  const t = getTranslator(translations);

  return (
    <table className="w-full border-collapse table-fixed">
      <thead className="border-b-gray-300 border-b">
        <tr>
          <th className="sm:w-24 md:w-36">{t('winners.year')}</th>
          <th>{t('winners.first')}</th>
          <th>{t('winners.second')}</th>
          <th>{t('winners.third')}</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) =>
          'announcement' in result ? (
            <TournamentAnnouncementRow
              key={result.year}
              event={event}
              tournament={result}
              translations={translations}
            />
          ) : (
            <TournamentMedalistsRow key={result.year} event={event} result={result} translations={translations} />
          )
        )}
      </tbody>
    </table>
  );
}

function TournamentMedalistsRow({
  event,
  result,
  translations,
}: {
  event: EventContext;
  result: Result;
  translations: Translations;
}) {
  const { year, top, players } = result;

  return (
    <tr className="text-center even:bg-gray-200 hover:bg-gray-300">
      <td className="p-2">
        <Link
          className="sm:text-xl font-bold text-event-primary underline hover:text-event-hover"
          href={tournamentUrl(event, translations.locale, year)}
        >
          {year}
        </Link>
      </td>
      {MEDALS.map((index) => (
        <td className="p-1 wrap-break-word hyphens-auto" key={index}>
          {top[index]?.length
            ? jsxJoin(
                top[index].map((id) => (
                  <PlayerLink key={id} event={event} playerId={players[id].id} locale={translations.locale}>
                    <PlayerName player={players[id]} showCountry={event.showCountry} />
                  </PlayerLink>
                )),
                ', '
              )
            : '-'}
        </td>
      ))}
    </tr>
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
    <tr className="group text-center bg-event-primary text-white hover:bg-event-hover hover:text-white transition-colors duration-500">
      <td className="p-2">
        <Link
          className="sm:text-xl font-bold text-current underline hover:text-current"
          href={tournamentUrl(event, translations.locale, year)}
        >
          {year}
        </Link>
      </td>
      <td colSpan={3} className="wrap-break-word text-center underline-offset-2 p-1">
        {website ? (
          <a href={website} className="cursor-pointer flex gap-2 items-center justify-center">
            {content}
            <LuExternalLink />
          </a>
        ) : (
          content
        )}
      </td>
    </tr>
  );
}
