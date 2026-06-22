import { loadConfiguredEvents, loadSingleEvent } from '@/events';
import { loadConfiguration } from '@/configuration';
import { getSitemapRouteOptions, serveSitemap } from '@/routes/serveSitemap';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, props: PageProps) {
  const configuration = await loadConfiguration();
  const [event] = await loadConfiguredEvents(configuration);

  return serveSitemap(event, (await props.params).locale);
}

export async function generateStaticParams() {
  return getSitemapRouteOptions(await loadSingleEvent());
}
