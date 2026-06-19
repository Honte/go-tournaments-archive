import type { EventContext } from '@/schema/event';
import { getTournaments } from '@/data/serverApi';
import { loadSgfs } from '@/data/sgfs';

export async function serveSgfList(event: EventContext) {
  const tournaments = await getTournaments(event);
  const games = await loadSgfs(tournaments);

  return Response.json(games);
}
