import { loadDefaultEvent } from '@/events';
import { getSitemapRouteOptions, serveSitemap } from '@/routes/serveSitemap';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveSitemap(await loadDefaultEvent(), (await props.params).locale);
}

export async function generateStaticParams() {
  return getSitemapRouteOptions(await loadDefaultEvent());
}
