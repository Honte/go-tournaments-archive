import { loadSingleEvent } from '@/events';
import { getCountryStatsRouteOptions, serveCountryStats } from '@/routes/serveCountryStats';

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveCountryStats(await loadSingleEvent(), (await props.params).code);
}

export async function generateStaticParams() {
  return getCountryStatsRouteOptions(await loadSingleEvent());
}
