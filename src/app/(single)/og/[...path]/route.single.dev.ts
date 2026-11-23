import type { NextRequest } from 'next/server';
import { loadSingleEvent } from '@/events';
import { getSingleOgImageOptions, serveEventOgImage } from '@/routes/serveOgImage';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { path } = await props.params;
  const event = await loadSingleEvent();

  return serveEventOgImage(event, path);
}

export async function generateStaticParams() {
  return getSingleOgImageOptions(await loadSingleEvent());
}
