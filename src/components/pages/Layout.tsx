import { Inter } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { Client } from '@/components/Client';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { QueryProvider } from '@/components/QueryProvider';
import '@/globals.css';

const inter = Inter({ subsets: ['latin'] });

type LayoutProps = PropsWithChildren<{ event: EventContext; translations: Translations }>;

export function Layout({ event, translations, children }: LayoutProps) {
  return (
    <html lang={translations.locale} className="min-h-full bg-event-light">
      <body className={`${inter.className} min-h-dvh flex flex-col text-event-dark`}>
        <QueryProvider>
          <Header event={event} translations={translations} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 flex flex-col container max-w-(--breakpoint-2xl) mx-auto p-4 w-full">
              {children}
            </main>
            <Footer translations={translations} />
          </div>
          <Client locale={translations.locale} event={event} />
        </QueryProvider>
      </body>
    </html>
  );
}
