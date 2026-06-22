import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { getCategoryStats } from '@/data/serverApi';

export async function serveCategoryStats(event: EventContext, categoryParam?: string) {
  const check = categoryParam?.match(/^(.+)\.json$/);
  const category = check?.[1];

  if (!category) {
    return notFound();
  }

  const categoryStats = await getCategoryStats(event, category);

  if (!categoryStats) {
    return notFound();
  }

  return Response.json(categoryStats);
}

export function getCategoryStatsRouteOptions(event: EventContext) {
  return (event.categories || ['none']).map((category) => ({
    category: `${category}.json`,
  }));
}
