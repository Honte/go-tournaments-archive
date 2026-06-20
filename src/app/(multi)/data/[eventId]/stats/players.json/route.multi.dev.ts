import { loadEvent } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveAllPlayersStats } from '@/routes/serveAllPlayersStats';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);

  return serveAllPlayersStats(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
