import type { NextRequest } from 'next/server';
import { loadEventFromPrefix } from '@/events';
import { loadConfiguration } from '@/configuration';
import { getMultiOgImageOptions, serveArchiveOgImage, serveEventOgImage } from '@/routes/serveOgImage';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { path } = await props.params;

  if (path.length === 2 && path[1] === 'archive.jpg') {
    const configuration = await loadConfiguration();

    return serveArchiveOgImage(configuration, path[0]);
  }

  const [eventPrefix, ...rest] = path;

  if (!eventPrefix || rest.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const event = await loadEventFromPrefix(eventPrefix);

    return serveEventOgImage(event, rest);
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

export async function generateStaticParams() {
  return getMultiOgImageOptions(await loadConfiguration());
}
