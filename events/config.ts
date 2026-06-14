import type { EventConfig } from '@/schema/event';
import { normalizeBasePath } from '@/libs/basePath';
import { EVENT, BASE_PATH } from './env';

const { default: config } = (await import(`./${EVENT}/config.ts`)) as { default: EventConfig };

export default {
  ...config,
  basePath: normalizeBasePath(config.basePath ?? BASE_PATH),
} as EventConfig;
