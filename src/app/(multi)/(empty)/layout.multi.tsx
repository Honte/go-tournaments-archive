import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { buildMultiArchiveLayoutMetadata } from '@/libs/metadata';
import { BaseLayout } from '@/components/pages/BaseLayout';
import { loadConfiguration } from '@/configuration';

export async function generateMetadata(): Promise<Metadata> {
  return buildMultiArchiveLayoutMetadata(await loadConfiguration());
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const configuration = await loadConfiguration();
  const locale = configuration.locales?.[0] ?? 'en';

  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
