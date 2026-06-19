import { loadDefaultEvent } from '@/events';
import { getPlayerStatsOptions, servePlayerStats } from '@/routes/servePlayerStats';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return servePlayerStats(await loadDefaultEvent(), (await props.params).slug);
}

export async function generateStaticParams() {
  return getPlayerStatsOptions(await loadDefaultEvent());
}
