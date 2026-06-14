import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { loadDefaultEvent } from '@/events';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { appleIconUrl, faviconUrl } from '@/libs/urls';
import { Client } from '@/components/Client';
import { Footer } from '@/components/Footer';
import '../globals.css';
import { Header } from '@/components/Header';
import { QueryProvider } from '@/components/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata(props: RootLayoutProps): Promise<Metadata> {
  const event = await loadDefaultEvent();
  const { locale } = await props.params;

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await loadTranslations(event, locale);
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

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

  return event.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const event = await loadDefaultEvent();
  const { locale } = await params;

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await loadTranslations(event, locale);

  return (
    <html lang={locale} className="min-h-full bg-event-light">
      <body className={`${inter.className} min-h-dvh flex flex-col text-event-dark`}>
        <QueryProvider>
          <Header event={event} translations={translations} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 flex flex-col container max-w-(--breakpoint-2xl) mx-auto p-4 w-full">
              {children}
            </main>
            <Footer translations={translations} />
          </div>
          <Client locale={locale} event={event} />
        </QueryProvider>
      </body>
    </html>
  );
}
