import type { NextRequest } from 'next/server';
import { loadSingleEvent } from '@/events';
import { serveEventOgImage } from '@/routes/serveOgImage';

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { path } = await props.params;
  const event = await loadSingleEvent();

  return serveEventOgImage(event, path);
}
