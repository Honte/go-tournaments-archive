import type { EventContext } from '@/schema/event';
import { getEventSummary } from '@/data/serverApi';

export async function serveEventSummary(event: EventContext) {
  return Response.json(await getEventSummary(event));
}
