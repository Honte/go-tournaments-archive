import { LuExternalLink } from 'react-icons/lu';
import type { Locale } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { homeUrl } from '@/libs/urls';
import type { EventEntry } from '@/components/multi/schema';
import { Link } from '@/components/navigation/Link';
import { ThemeLogo } from '@/components/ui/ThemeLogo';

type EventCardProps = EventEntry & {
  locale: Locale;
  hasSingleLocale?: boolean;
};

const EXTERNAL_LABELS: Record<Locale, string> = {
  en: 'Self-hosted archive',
  pl: 'Zewnętrzne archiwum',
};

export function EventCard({ event, name, locale, hasSingleLocale }: EventCardProps) {
  let eventLocale = locale;
  let eventName = getString(name, eventLocale);

  if (!eventName) {
    eventLocale = event.locales[0];
    eventName = getString(name, eventLocale);
  }

  return (
    <article
      key={event.id}
      className="flex min-h-52 flex-col overflow-hidden rounded-lg border bg-archive-surface shadow-sm transition-shadow hover:shadow-md border-archive-border"
    >
      <Link
        href={homeUrl(event, eventLocale)}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 p-2 text-center hover:bg-archive-surface-hover"
      >
        {event.external && (
          <span className="flex items-center gap-1 self-end rounded-full bg-archive-page px-2 py-1 text-[.6rem] font-medium text-archive-text/70">
            {EXTERNAL_LABELS[locale]}
            <LuExternalLink aria-hidden="true" />
          </span>
        )}
        <ThemeLogo event={event} className="h-16 w-full max-w-48 object-contain my-2" />
        <h3 className="text-base font-bold leading-snug min-h-[2lh]">{eventName}</h3>
      </Link>
      {!hasSingleLocale && (
        <nav className="flex items-center justify-center gap-2 border-t border-archive-border p-3">
          {event.locales.map((locale) => (
            <Link
              key={locale}
              href={homeUrl(event, locale)}
              className="min-w-10 rounded-sm bg-archive-surface-muted px-3 py-1 text-center text-sm font-bold hover:bg-archive-surface-hover"
            >
              {locale.toUpperCase()}
            </Link>
          ))}
        </nav>
      )}
    </article>
  );
}
