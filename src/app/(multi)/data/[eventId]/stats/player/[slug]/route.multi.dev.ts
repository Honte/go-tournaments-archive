import { loadEvent } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getPlayerStatsRouteOptions, servePlayerStats } from '@/routes/servePlayerStats';

type RouteProps = {
  params: Promise<{
    eventId: string;
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId, slug } = await params;
  const event = await loadEvent(eventId);

  return servePlayerStats(event, slug);
}

export async function generateStaticParams() {
  return loadAllOptions(getPlayerStatsRouteOptions);
}
