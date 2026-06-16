import { loadDefaultEvent } from '@/events';
import { getTournaments } from '@/data/serverApi';
import { loadSgfs } from '@/data/sgfs';

export const dynamic = 'force-static';

export async function GET(_: Request) {
  const event = await loadDefaultEvent();
  const tournaments = await getTournaments(event);
  const games = await loadSgfs(tournaments);

  return Response.json(games);
}
