import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import type { EventConfig, EventContext } from '@/schema/event';
import { BASE_PATH, EVENT } from './env';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export async function loadAllEvents(): Promise<EventContext[]> {
  const files = await fg.glob(`../events/*/config.ts`, {
    cwd: __dirname,
  });

  return Promise.all(
    files.map(async (file) => {
      const { default: config } = (await import(file)) as { default: EventConfig };

      return {
        ...config,
        basePath: BASE_PATH,
        prefix: config.id,
      };
    })
  );
}
