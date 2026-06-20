import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import type { EventConfig, EventContext } from '@/schema/event';
import { BASE_PATH, EVENT } from './env';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadDefaultEvent() {
  return loadEvent(EVENT || 'pgc', false);
}

export async function loadEvent(eventId: string, withPrefix = true): Promise<EventContext> {
  const { default: config } = (await import(`../events/${eventId}/config.ts`)) as { default: EventConfig };

  return {
    ...config,
    basePath: BASE_PATH,
    withPrefix,
  };
}

export async function loadAllEvents(): Promise<EventContext[]> {
  const ids = await findAllEvents();

  return Promise.all(ids.map((id) => loadEvent(id)));
}

export async function findAllEvents() {
  const files = await fg.glob(`*/config.ts`, {
    cwd: join(__dirname, '../events'),
  });

  return files.map(dirname).sort();
}
