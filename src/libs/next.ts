import type { EventContext } from '@/schema/event';
import { loadConfiguredEvents } from '@/events';
import { loadConfiguration } from '@/configuration';

export async function loadEventOptions(skipExternal = true) {
  const configuration = await loadConfiguration();
  const events = await loadConfiguredEvents(configuration);
  const results = [];

  for (const event of events) {
    if (event.external && skipExternal) {
      continue;
    }

    results.push({
      eventId: event.prefix,
    });
  }

  return results;
}

export async function loadAllOptions<T>(fn: (event: EventContext) => T[] | Promise<T[]>, skipExternal = true) {
  const configuration = await loadConfiguration();
  const events = await loadConfiguredEvents(configuration);
  const results = [];

  for (const event of events) {
    if (event.external && skipExternal) {
      continue;
    }

    for (const option of await fn(event)) {
      results.push({
        ...option,
        eventId: event.prefix,
      });
    }
  }

  return results;
}
