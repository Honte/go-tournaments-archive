import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { getAllPlayersStats, getPlayerStats } from '@/data/serverApi';

export async function servePlayerStats(event: EventContext, slugParam?: string) {
  const check = slugParam?.match(/^(.+)\.json$/);
  const slug = check?.[1];

  if (!slug) {
    return notFound();
  }

  const stats = await getPlayerStats(event, slug);

  if (!stats) {
    return notFound();
  }

  return Response.json(stats);
}

export async function getPlayerStatsOptions(event: EventContext) {
  const stats = await getAllPlayersStats(event);

  return Object.values(stats).map((players) => ({
    slug: `${players.id}.json`,
  }));
}
