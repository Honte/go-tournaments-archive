import type { NextRequest } from 'next/server';
import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getSgfAssetOptions, serveSgfAsset } from '@/routes/serveSgfAsset';
import { serveSgfsZip } from '@/routes/serveSgfsZip';

type RouteProps = {
  params: Promise<{
    eventId: string;
    path: string[];
  }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { path, eventId } = await props.params;
  const event = await loadEventFromPrefix(eventId);

  if (path.length === 1 && path[0].match(/^\d+\.zip$/)) {
    return serveSgfsZip(event, Number(path[0].replace(/\.zip$/, '')));
  }

  return serveSgfAsset(event, path);
}

export async function generateStaticParams() {
  return loadAllOptions(getSgfAssetOptions);
}
