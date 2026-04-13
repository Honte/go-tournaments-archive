import '@event/colors.css';
import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const translations = await loadTranslations('en');
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
    icons: {
      icon: { url: '/icon.svg', type: 'image/svg+xml' },
      apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    },
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className="size-full bg-event-light">
      <body>{children}</body>
    </html>
  );
}
