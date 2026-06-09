import { LuExternalLink } from 'react-icons/lu';
import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';

type TournamentAnnouncementProps = {
  tournament: Tournament;
  translations: Translations;
};

export function TournamentAnnouncement({ tournament, translations }: TournamentAnnouncementProps) {
  if (!tournament.announcement) {
    return null;
  }

  const t = getTranslator(translations);
  const content =
    (typeof tournament.announcement === 'object'
      ? tournament.announcement[translations.locale]
      : typeof tournament.announcement === 'string'
        ? tournament.announcement
        : undefined) ?? t('site.eventName');

  return (
    <section className="my-4 bg-event-primary text-xl text-white hover:bg-event-hover transition-colors duration-500 rounded-lg flex items-center justify-center">
      {tournament.website && !Array.isArray(tournament.website) ? (
        <a href={tournament.website} className="cursor-pointer p-4 flex flex-1 gap-2 items-center justify-center">
          {content}
          <LuExternalLink />
        </a>
      ) : (
        <p className="p-4">{content}</p>
      )}
    </section>
  );
}
