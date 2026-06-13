import type { EventConfig } from '@/schema/event';
import EVENT from './index';

export default (await import(`./${EVENT}/config.ts`)).default as EventConfig;
