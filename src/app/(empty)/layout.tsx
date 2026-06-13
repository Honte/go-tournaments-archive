import EVENT_CONFIG from '@event/config';
import '@event/colors.css';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { Endpoints } from '@/libs/endpoints';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const translations = await loadTranslations(EVENT_CONFIG);
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
    icons: {
      icon: { url: Endpoints.FAVICON(), type: 'image/svg+xml' },
      apple: { url: Endpoints.APPLE_ICON(), type: 'image/png', sizes: '180x180' },
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className="size-full bg-event-light" lang={EVENT_CONFIG.locales[0]}>
      <body>{children}</body>
    </html>
  );
}
