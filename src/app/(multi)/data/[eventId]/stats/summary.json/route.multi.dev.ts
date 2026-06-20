import { loadEvent } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveEventSummary } from '@/routes/serveEventSummary';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);

  return serveEventSummary(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
