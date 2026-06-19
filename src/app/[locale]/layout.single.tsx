import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadDefaultEvent } from '@/events';
import { getLayoutMetadata, Layout } from '@/components/pages/Layout';

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata(props: RootLayoutProps): Promise<Metadata> {
  const event = await loadDefaultEvent();
  const { locale } = await props.params;

  return getLayoutMetadata({ event, locale });
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

  return event.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const event = await loadDefaultEvent();
  const { locale } = await params;

  return (
    <Layout event={event} locale={locale}>
      {children}
    </Layout>
  );
}
