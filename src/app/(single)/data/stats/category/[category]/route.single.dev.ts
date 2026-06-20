import { loadDefaultEvent } from '@/events';
import { getCategoryStatsRouteOptions, serveCategoryStats } from '@/routes/serveCategoryStats';

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveCategoryStats(await loadDefaultEvent(), (await props.params).category);
}

export async function generateStaticParams() {
  return getCategoryStatsRouteOptions(await loadDefaultEvent());
}
