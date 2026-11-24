import type { NextRequest } from 'next/server';
import { loadSingleEvent } from '@/events';
import { getEventSocialImageOptions, serveEventSocialImage } from '@/routes/serveSocialImage';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{
    locale: string;
    path: string[];
  }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { locale, path } = await props.params;
  const event = await loadSingleEvent();

  return serveEventSocialImage(event, locale, path);
}

export async function generateStaticParams() {
  return getEventSocialImageOptions(await loadSingleEvent());
}
