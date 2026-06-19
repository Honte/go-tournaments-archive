import { loadDefaultEvent } from '@/events';
import { getCountryStatsOptions, serveCountryStats } from '@/routes/serveCountryStats';

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveCountryStats(await loadDefaultEvent(), (await props.params).code);
}

export async function generateStaticParams() {
  return getCountryStatsOptions(await loadDefaultEvent());
}
