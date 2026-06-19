import { loadDefaultEvent } from '@/events';
import { getTranslationsOptions, serveTranslations } from '@/routes/serveTranslations';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveTranslations(await loadDefaultEvent(), (await props.params).locale);
}

export async function generateStaticParams() {
  return getTranslationsOptions(await loadDefaultEvent());
}
