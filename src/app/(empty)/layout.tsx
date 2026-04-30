import '@event/colors.css';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const translations = await loadTranslations(DEFAULT_LOCALE);
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
    icons: {
      icon: { url: '/favicon.svg', type: 'image/svg+xml' },
      apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className="size-full bg-event-light" lang={DEFAULT_LOCALE}>
      <body>{children}</body>
    </html>
  );
}
