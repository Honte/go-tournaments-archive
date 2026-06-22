import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getTranslationsRouteOptions, serveTranslations } from '@/routes/serveTranslations';

type PageProps = {
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
};

export async function GET(_: Request, { params }: PageProps) {
  const { eventId, locale } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveTranslations(event, locale);
}

export async function generateStaticParams() {
  return loadAllOptions(getTranslationsRouteOptions);
}
