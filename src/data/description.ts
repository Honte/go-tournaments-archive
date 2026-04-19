import EVENT from '@event';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_PATH = `./events/${EVENT}/data`;

export async function getTournamentDescription(year: string | number, locale: string) {
  const translated = join(DATA_PATH, `${year}.${locale}.md`);
  const generic = join(DATA_PATH, `${year}.md`);

  if (existsSync(translated)) {
    return readFile(translated, 'utf-8');
  }

  if (existsSync(generic)) {
    return readFile(generic, 'utf-8');
  }

  return undefined;
}
