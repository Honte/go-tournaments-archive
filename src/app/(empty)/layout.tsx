import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadDefaultEvent } from '@/events';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { appleIconUrl, faviconUrl } from '@/libs/urls';
import '@/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event);
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
    icons: {
      icon: { url: faviconUrl(event.basePath, event.prefix), type: 'image/svg+xml' },
      apple: { url: appleIconUrl(event.basePath, event.prefix), type: 'image/png', sizes: '180x180' },
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const event = await loadDefaultEvent();

  return (
    <html className="size-full bg-event-light" lang={event.locales[0]}>
      <body>{children}</body>
    </html>
  );
}
