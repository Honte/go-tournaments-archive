import { LuExternalLink } from 'react-icons/lu';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';
import type { Announcement } from './types';

type TournamentAnnouncementBannerProps = {
  event: EventContext;
  tournament: Announcement;
  translations: Translations;
};

export function TournamentAnnouncementBanner({ event, tournament, translations }: TournamentAnnouncementBannerProps) {
  const { announcement, year, website } = tournament;
  const t = getTranslator(translations);
  const content =
    (typeof announcement === 'object'
      ? announcement[translations.locale]
      : typeof announcement === 'string'
        ? announcement
        : undefined) ?? t('site.eventName');

  return (
    <div className="flex overflow-hidden rounded-xl border border-archive-accent-fill bg-archive-accent-fill text-archive-accent-text shadow-sm transition-colors duration-500 hover:bg-archive-accent-fill-hover">
      <Link
        href={tournamentUrl(event, translations.locale, year)}
        className="flex shrink-0 items-center px-4 py-3 text-xl font-bold text-current no-underline hover:text-current sm:text-2xl"
      >
        {year}
      </Link>
      <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-3 text-center font-semibold">
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
