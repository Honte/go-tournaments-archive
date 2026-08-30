import type { ArchiveConfiguration } from '@/schema/event';
import { loadConfiguredEvents } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadAllTranslations, loadBaseTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { EventSelector, type MultiEventTranslations } from '@/components/multi/EventSelector';
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

  const hasSingleLocale =
    eventsWithTranslations.every((entry) => entry.event.locales.length === 1) &&
    (!configuration.locales || configuration.locales.length === 1);

  const translations = await loadMultiTranslations(configuration.locales);

  return (
    <Content>
      <EventSelector
        groups={groups}
        title={configuration.title}
        footer={configuration.footer}
        locales={configuration.locales}
        hasSingleLocale={hasSingleLocale}
        translations={translations}
      />
    </Content>
  );
}

export async function loadMultiTranslations(locales?: string[]) {
  const requested = locales?.length ? locales : ['en'];
  const allTranslations = await Promise.all(requested.map((locale) => loadBaseTranslations(locale as Locale)));

  return requested.reduce<Partial<Record<Locale, MultiEventTranslations>>>((all, locale, index) => {
    const t = getTranslator(allTranslations[index]);

    all[locale as Locale] = {
      localeSelector: t('navigation.locale'),
      themeSelector: t('navigation.theme.label'),
      themeAuto: t('navigation.theme.auto'),
      themeLight: t('navigation.theme.light'),
      themeDark: t('navigation.theme.dark'),
    };

    return all;
  }, {});
}
