import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import { getCountryStats } from '@/data/serverApi';

type PageProps = {
  params: Promise<{ code: string }>;
};

export async function GET(_: Request, props: PageProps) {
  const { code: codeParam } = await props.params;
  const check = codeParam.match(/^([a-z]{2})\.json$/i);
  const code = check?.[1]?.toUpperCase();

  if (!code) {
    return notFound();
  }

  const event = await loadDefaultEvent();
  const stats = await getCountryStats(event, code);

  if (!stats) {
    return notFound();
  }

  return Response.json(stats);
}
