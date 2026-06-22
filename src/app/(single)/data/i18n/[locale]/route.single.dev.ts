import { loadSingleEvent } from '@/events';
import { getTranslationsRouteOptions, serveTranslations } from '@/routes/serveTranslations';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveTranslations(await loadSingleEvent(), (await props.params).locale);
}

export async function generateStaticParams() {
  return getTranslationsRouteOptions(await loadSingleEvent());
}
