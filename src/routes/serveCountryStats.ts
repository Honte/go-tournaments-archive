import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { getAllCountriesStats, getCountryStats } from '@/data/serverApi';

export async function serveCountryStats(event: EventContext, codeParam?: string) {
  const check = codeParam?.match(/^([a-z]{2})\.json$/i);
  const code = check?.[1]?.toUpperCase();

  if (!code) {
    return notFound();
  }

  const stats = await getCountryStats(event, code);

  if (!stats) {
    return notFound();
  }

  return Response.json(stats);
}

export async function getCountryStatsRouteOptions(event: EventContext) {
  const stats = await getAllCountriesStats(event);

  return Object.values(stats).map((country) => ({
    code: `${country.code.toLowerCase()}.json`,
  }));
}
