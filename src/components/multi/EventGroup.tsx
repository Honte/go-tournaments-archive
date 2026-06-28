import type { Locale } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { EventCard } from '@/components/multi/EventCard';
import type { EventEntryGroup } from '@/components/multi/schema';
import { H2 } from '@/components/ui/H2';

type EventGroupProps = EventEntryGroup & {
  locale: Locale;
  hasSingleLocale?: boolean;
};

export function EventGroup({ title, events, locale, hasSingleLocale }: EventGroupProps) {
  return (
    <section className="flex flex-col gap-3">
      {title && <H2>{getString(title, locale)}</H2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => (
          <EventCard
            key={event.event.id}
            event={event.event}
            name={event.name}
            locale={locale}
            hasSingleLocale={hasSingleLocale}
          />
        ))}
      </div>
    </section>
  );
}
