import { EVENT } from '@/env';
import { loadAllEvents, loadEvent } from '@/events';
import { buildAssets } from '@tools/assets/build';

const events = EVENT ? [await loadEvent(EVENT)] : await loadAllEvents();

try {
  console.log(`[assets] generating assets for ${events.length > 1 ? `${events.length} events` : events[0].id}`);
  const start = Date.now();
  await buildAssets(events);
  console.log(`[assets] completed in ${Date.now() - start}ms`);
} catch (err) {
  console.log(`[assets] failed to generate assets`);
  console.error(err);
  process.exit(1);
}
