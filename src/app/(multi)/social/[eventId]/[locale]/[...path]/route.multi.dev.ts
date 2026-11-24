import type { NextRequest } from 'next/server';
import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getEventSocialImageOptions, serveEventSocialImage } from '@/routes/serveSocialImage';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{
    eventId: string;
    locale: string;
    path: string[];
  }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { eventId, locale, path } = await props.params;

  try {
    const event = await loadEventFromPrefix(eventId);

    return serveEventSocialImage(event, locale, path);
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

export async function generateStaticParams() {
  return loadAllOptions(getEventSocialImageOptions);
}
