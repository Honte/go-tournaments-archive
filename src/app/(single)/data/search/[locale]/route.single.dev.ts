import { loadSingleEvent } from '@/events';
import { getSearchRouteOptions, serveSearch } from '@/routes/serveSearch';

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  return serveSearch(await loadSingleEvent(), (await params).locale);
}

export async function generateStaticParams() {
  return getSearchRouteOptions(await loadSingleEvent());
}
