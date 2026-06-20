import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadDefaultEvent } from '@/events';
import { BaseLayout } from '@/components/pages/BaseLayout';
import { EventLayout, getEventLayoutMetadata } from '@/components/pages/EventLayout';

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const event = await loadDefaultEvent();
  const { locale } = await params;

  return (
    <BaseLayout locale={locale}>
      <EventLayout event={event} locale={locale}>
        {children}
      </EventLayout>
    </BaseLayout>
  );
}

export async function generateMetadata(props: RootLayoutProps): Promise<Metadata> {
  const event = await loadDefaultEvent();
  const { locale } = await props.params;

  return getEventLayoutMetadata({ event, locale });
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

  return event.locales.map((locale) => ({ locale }));
}
