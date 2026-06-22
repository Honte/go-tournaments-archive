import type { EventContext } from '@/schema/event';
import { getAllPlayersStats } from '@/data/serverApi';

export async function serveAllPlayersStats(event: EventContext) {
  return Response.json(await getAllPlayersStats(event));
}
