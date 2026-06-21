import type { NextRequest } from 'next/server';
import { loadSingleEvent } from '@/events';
import { serveSgfAsset, getSgfAssetOptions } from '@/routes/serveSgfAsset';
import { serveSgfsZip } from '@/routes/serveSgfsZip';

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { path: segments } = await props.params;
  const event = await loadSingleEvent();

  if (segments.length === 1 && segments[0].match(/^\d+\.zip$/)) {
    return serveSgfsZip(event, Number(segments[0].replace(/\.zip$/, '')));
  }

  return serveSgfAsset(event, segments);
}

export async function generateStaticParams() {
  return getSgfAssetOptions(await loadSingleEvent());
}
