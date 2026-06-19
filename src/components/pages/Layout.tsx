import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import '@/globals.css';
import { appleIconUrl, faviconUrl } from '@/libs/urls';
import { getTranslations } from '@/data/serverApi';
import { Client } from '@/components/Client';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { QueryProvider } from '@/components/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

type LayoutProps = PropsWithChildren<{
  event: EventContext;
  locale: string;
}>;

export async function Layout({ event, locale, children }: LayoutProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);

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

export async function getLayoutMetadata({ event, locale }: LayoutProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
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
