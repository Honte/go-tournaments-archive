import EVENT from './index';
import type { EventConfig } from './schema';

export default (await import(`./${EVENT}/config.ts`)).default as EventConfig;
