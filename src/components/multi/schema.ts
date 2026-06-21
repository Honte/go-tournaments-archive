import type { EventContext } from '@/schema/event';
import type { LocalizedString } from '@/i18n/consts';

export type EventEntry = {
  name: LocalizedString;
  event: EventContext;
};

export type EventEntryGroup = {
  title?: LocalizedString;
  events: EventEntry[];
};
