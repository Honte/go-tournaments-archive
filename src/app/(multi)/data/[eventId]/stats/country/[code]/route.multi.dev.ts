import { loadEvent } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getCountryStatsRouteOptions, serveCountryStats } from '@/routes/serveCountryStats';

type PageProps = {
  params: Promise<{
    eventId: string;
    code: string;
  }>;
};

export async function GET(_: Request, { params }: PageProps) {
  const { eventId, code } = await params;
  const event = await loadEvent(eventId);

  return serveCountryStats(event, code);
}

export async function generateStaticParams() {
  return loadAllOptions(getCountryStatsRouteOptions);
}
