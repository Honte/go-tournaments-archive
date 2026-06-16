import type { EventContext } from '@/schema/event';
import { loadAllTranslations } from '@/i18n/server';
import { buildDataAssets } from '@tools/assets/data';
import { buildSgfsAssets } from '@tools/assets/sgfs';
import { loadData } from '@/data/load';

export async function buildAssets(event: EventContext) {
  console.log(`[assets] generating assets for ${event.id}`);
  const start = Date.now();

  const [data, allTranslations] = await Promise.all([loadData(event), loadAllTranslations(event)]);

  await Promise.all([buildDataAssets(event, data, allTranslations), buildSgfsAssets(event, data, allTranslations)]);

  console.log(`[assets] completed in ${Date.now() - start}ms`);
}
