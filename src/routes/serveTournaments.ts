import type { EventContext } from '@/schema/event';
import { getTournaments } from '@/data/serverApi';

export async function serveTournaments(event: EventContext) {
  return Response.json(await getTournaments(event));
}
