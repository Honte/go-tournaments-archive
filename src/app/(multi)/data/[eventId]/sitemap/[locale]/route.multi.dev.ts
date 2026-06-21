import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getSitemapRouteOptions, serveSitemap } from '@/routes/serveSitemap';

type RouteProps = {
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveSitemap(event, locale);
}

export async function generateStaticParams() {
  return loadAllOptions(getSitemapRouteOptions);
}
