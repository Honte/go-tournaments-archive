import type { EventConfig, EventContext } from '@/schema/event';
import { EVENT, BASE_PATH } from './env';

export function loadDefaultEvent() {
  return loadEvent(EVENT);
}

export async function loadEvent(eventId: string, prefix?: string): Promise<EventContext> {
  const { default: config } = (await import(`../events/${eventId}/config.ts`)) as { default: EventConfig };

  return {
    ...config,
    basePath: BASE_PATH,
    prefix,
  };
}
