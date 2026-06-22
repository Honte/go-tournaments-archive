import { loadSingleEvent } from '@/events';
import { getPlayerStatsRouteOptions, servePlayerStats } from '@/routes/servePlayerStats';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return servePlayerStats(await loadSingleEvent(), (await props.params).slug);
}

export async function generateStaticParams() {
  return getPlayerStatsRouteOptions(await loadSingleEvent());
}
