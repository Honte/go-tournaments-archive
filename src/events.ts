import type { ArchiveConfiguration, EventContext, EventDefinition } from '@/schema/event';
import { getEventConfigurations, loadConfiguration } from '@/configuration';

export async function loadSingleEvent(): Promise<EventContext> {
  const config = await loadConfiguration();
  const [eventConfig] = getEventConfigurations(config);
  const definition = await loadEventDefinition(eventConfig.id);

  return {
    ...definition,
    ...eventConfig,
  };
}

export async function loadConfiguredEvents(config: ArchiveConfiguration): Promise<EventContext[]> {
  const eventConfigs = getEventConfigurations(config);

  return Promise.all(
    eventConfigs.map(async (eventConfig) => {
      const definition = await loadEventDefinition(eventConfig.id);

      return {
        ...definition,
        ...eventConfig,
      };
    })
  );
}

export async function loadEventFromPrefix(eventPrefix: string): Promise<EventContext> {
  const config = await loadConfiguration();
  const eventConfigs = getEventConfigurations(config);
  const targetEvent = eventConfigs.find((event) => event.prefix === eventPrefix);

  if (!targetEvent) {
    throw new Error(`Event not found: ${eventPrefix}`);
  }

  const definition = await loadEventDefinition(targetEvent.id);

  return {
    ...definition,
    ...targetEvent,
  };
}

async function loadEventDefinition(eventId: string): Promise<EventDefinition> {
  const configModule = await import(`../events/${eventId}/config.ts`);

  return configModule.default as EventDefinition;
}
