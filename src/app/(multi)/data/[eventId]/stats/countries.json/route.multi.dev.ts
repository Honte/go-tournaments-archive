import { loadEvent } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveAllCountriesStats } from '@/routes/serveAllCountriesStats';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);

  return serveAllCountriesStats(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
