import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getSearchRouteOptions, serveSearch } from '@/routes/serveSearch';

type RouteProps = {
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId, locale } = await params;

  return serveSearch(await loadEventFromPrefix(eventId), locale);
}

export async function generateStaticParams() {
  return loadAllOptions(getSearchRouteOptions);
}
