import type { EventContext } from '@/schema/event';
import { getTournamentTables } from '@/data/serverApi';

export async function serveTournamentTables(event: EventContext) {
  return Response.json(await getTournamentTables(event));
}
