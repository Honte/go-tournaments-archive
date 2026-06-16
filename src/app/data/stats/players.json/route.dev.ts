import { loadDefaultEvent } from '@/events';
import { getAllPlayersStats } from '@/data/serverApi';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getAllPlayersStats(event));
}
