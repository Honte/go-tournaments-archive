import { readYamlEnv } from 'yaml-env-defaults';
import type { ArchiveConfiguration, EventConfiguration } from '@/schema/event';

export const CONFIG = process.env.CONFIG || (process.env.EVENT ? 'single' : 'multi');
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function loadConfiguration() {
  return readYamlEnv<ArchiveConfiguration>(`./configurations/${CONFIG}.yml`, {
    EVENT: process.env.EVENT,
    BASE_PATH: process.env.BASE_PATH || '',
  });
}

export function getEventConfigurations(configuration: ArchiveConfiguration) {
  const results: EventConfiguration[] = [];

  for (const item of configuration.events) {
    if ('title' in item) {
      for (const child of item.events) {
        results.push({
          ...configuration.config,
          ...item.config,
          ...child,
        });
      }
    } else {
      results.push({
        ...configuration.config,
        ...item,
      });
    }
  }

  return results;
}
