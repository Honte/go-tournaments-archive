import Link from 'next/link';
import type { Locale } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { homeUrl, logoBlackUrl } from '@/libs/urls';
import type { EventEntry } from '@/components/multi/schema';

type EventCardProps = EventEntry & {
  locale: Locale;
};

export function EventCard({ event, name, locale }: EventCardProps) {
  let eventLocale = locale;
  let eventName = getString(name, eventLocale);

  if (!eventName) {
    eventLocale = event.locales[0];
    eventName = getString(name, eventLocale);
  }

  return (
    <article key={event.id} className="flex min-h-52 flex-col rounded-md border border-event-soft bg-white">
      <Link
        href={homeUrl(event, eventLocale)}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center hover:bg-event-bg"
      >
        <img src={logoBlackUrl(event)} alt="" className="h-16 w-full max-w-48 object-contain" />
        <h3 className="text-base font-bold leading-snug">{eventName}</h3>
      </Link>
      <nav className="flex items-center justify-center gap-2 border-t border-event-soft p-3">
        {event.locales.map((locale) => (
          <Link
            key={locale}
            href={homeUrl(event, locale)}
            className="min-w-10 rounded-sm bg-event-bg px-3 py-1 text-center text-sm font-bold hover:bg-event-soft"
          >
            {locale.toUpperCase()}
          </Link>
        ))}
      </nav>
    </article>
  );
}
