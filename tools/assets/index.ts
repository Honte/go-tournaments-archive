import { loadConfiguredEvents } from '@/events';
import { buildAssets } from '@tools/assets/build';
import { loadConfiguration } from '@/configuration';

const configuration = await loadConfiguration();
const events = (await loadConfiguredEvents(configuration)).filter((event) => !event.external);

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
