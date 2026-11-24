import type { NextRequest } from 'next/server';
import { loadConfiguration } from '@/configuration';
import { getArchiveSocialImageOptions, serveArchiveSocialImage } from '@/routes/serveSocialImage';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function GET(_: NextRequest, props: RouteProps) {
  const { locale } = await props.params;
  const configuration = await loadConfiguration();

  return serveArchiveSocialImage(configuration, locale);
}

export async function generateStaticParams() {
  return getArchiveSocialImageOptions(await loadConfiguration());
}
