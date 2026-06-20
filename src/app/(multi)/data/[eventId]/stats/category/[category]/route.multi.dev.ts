import { loadEvent } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getCategoryStatsRouteOptions, serveCategoryStats } from '@/routes/serveCategoryStats';

type RouteProps = {
  params: Promise<{
    eventId: string;
    category: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId, category } = await params;
  const event = await loadEvent(eventId);

  return serveCategoryStats(event, category);
}

export async function generateStaticParams() {
  return loadAllOptions(getCategoryStatsRouteOptions);
}
