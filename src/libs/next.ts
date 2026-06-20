import type { EventContext } from '@/schema/event';
import { loadAllEvents } from '@/events';

export async function loadEventOptions() {
  const events = await loadAllEvents();

  return events.map((event) => ({ eventId: event.id }));
}

export async function loadAllOptions<T>(fn: (event: EventContext) => T[] | Promise<T[]>) {
  const events = await loadAllEvents();
  const results = [];

  for (const event of events) {
    for (const option of await fn(event)) {
      results.push({
        ...option,
        eventId: event.id,
      });
    }
  }

  return results;
}
