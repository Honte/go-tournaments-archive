import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EventConfig } from '@/schema/event';

export async function getTournamentDescription(event: EventConfig, year: string | number, locale: string) {
  const eventData = `./events/${event.id}/data`;
  const translated = join(eventData, `${year}.${locale}.md`);
  const generic = join(eventData, `${year}.md`);

  if (existsSync(translated)) {
    return readFile(translated, 'utf-8');
  }

  if (existsSync(generic)) {
    return readFile(generic, 'utf-8');
  }

  return undefined;
}
