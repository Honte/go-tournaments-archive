import type { EventContext } from '@/schema/event';
import { getAllCountriesStats } from '@/data/serverApi';

export async function serveAllCountriesStats(event: EventContext) {
  return Response.json(await getAllCountriesStats(event));
}
