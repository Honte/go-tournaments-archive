import type { ArchiveConfiguration } from '@/schema/event';
import { loadConfiguredEvents } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { EventSelector } from '@/components/multi/EventSelector';
import type { EventEntry, EventEntryGroup } from '@/components/multi/schema';
import { Content } from '@/components/ui/Content';

export type EventSelectorPageProps = {
  configuration: ArchiveConfiguration;
};

export async function EventSelectorPage({ configuration }: EventSelectorPageProps) {
  const events = await loadConfiguredEvents(configuration);
  const eventsWithTranslations = await Promise.all(
    events.map(async (event) => {
      const translations = await loadAllTranslations(event);

      return {
        event,
        name: event.locales.reduce(
          (map, locale) => {
            map[locale] = getTranslator(translations[locale])('site.name');
            return map;
          },
          {} as Record<Locale, string>
        ),
      };
    })
  );
  const eventsMap = eventsWithTranslations.reduce(
    (map, entry) => map.set(entry.event.id, entry),
    new Map<string, EventEntry>()
  );

  const groups: EventEntryGroup[] = [];
  const otherGroup: EventEntryGroup = {
    events: [],
  };
  for (const entry of configuration.events) {
    if ('title' in entry) {
      groups.push({
        title: entry.title,
        events: entry.events.map((event) => eventsMap.get(event.id)!),
      });
    } else {
      otherGroup.events.push(eventsMap.get(entry.id)!);
    }
  }

  if (groups.length > 0) {
    otherGroup.title = 'Other';
  }

  if (otherGroup.events.length > 0) {
    groups.push(otherGroup);
  }

  return (
    <Content>
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-8 p-4 sm:p-6">
        <EventSelector groups={groups} title={configuration.title} locales={configuration.locales} />
      </div>
    </Content>
  );
}
