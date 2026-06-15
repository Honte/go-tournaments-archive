import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EventConfig } from '@/schema/event';
import type { Locale } from '@/i18n/consts';

export async function loadTournamentDescription(event: EventConfig, year: string | number) {
  const generic = await readDescription(event, `${year}.md`);
  const localized = new Map<Locale, string>();

  for (const locale of event.locales) {
    const translated = await readDescription(event, `${year}.${locale}.md`);

    if (translated !== undefined) {
      localized.set(locale, translated);
    }
  }

  if (!localized.size) {
    return generic;
  }

  const descriptions = {} as Record<Locale, string>;

  for (const locale of event.locales) {
    descriptions[locale] = localized.get(locale) ?? generic ?? '';
  }

  return descriptions;
}

async function readDescription(event: EventConfig, file: string) {
  const path = join(`./events/${event.id}/data`, file);

  if (!existsSync(path)) {
    return undefined;
  }

  return readFile(path, 'utf-8');
}
