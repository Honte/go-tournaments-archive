import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { readYamlEnv } from 'yaml-env-defaults';
import type { ArchiveConfiguration, EventConfig, EventDefinition } from '@/schema/event';

const CONFIGURATIONS_DIR = 'configurations';
export const CONFIG = process.env.CONFIG || (process.env.EVENT ? 'single' : 'multi');
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function loadConfiguration() {
  return readYamlEnv<ArchiveConfiguration>(`./${CONFIGURATIONS_DIR}/${CONFIG}.yml`, {
    EVENT: process.env.EVENT,
    BASE_PATH: process.env.BASE_PATH || '',
  });
}

export async function getConfigurations() {
  const entries = await readdir(`./${CONFIGURATIONS_DIR}`);

  return entries
    .filter((entry) => path.extname(entry) === '.yml' && entry !== 'single.yml')
    .map((entry) => path.basename(entry, '.yml'))
    .sort((a, b) => a.localeCompare(b));
}

export function getEventConfigurations(configuration: ArchiveConfiguration) {
  const results: (EventConfig & { id: EventDefinition['id'] })[] = [];

  for (const item of configuration.events) {
    if ('title' in item) {
      for (const child of item.events) {
        results.push({
          ...configuration.config,
          ...item.config,
          ...child,
          basePath: configuration.basePath,
        });
      }
    } else {
      results.push({
        ...configuration.config,
        ...item,
        basePath: configuration.basePath,
      });
    }
  }

  return results;
}
