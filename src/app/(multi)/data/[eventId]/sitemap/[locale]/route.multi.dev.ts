import { loadConfiguredEvents } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { loadConfiguration } from '@/configuration';
import { getSitemapRouteOptions, serveSitemap } from '@/routes/serveSitemap';

type RouteProps = {
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId, locale } = await params;
  const configuration = await loadConfiguration();
  const events = await loadConfiguredEvents(configuration);

  return serveSitemap(
    events.find((event) => event.prefix === eventId),
    locale,
    events.filter((event) => event.prefix !== eventId)
  );
}

export async function generateStaticParams() {
  return loadAllOptions(getSitemapRouteOptions);
}
