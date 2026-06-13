import EVENT_CONFIG from '@event/config';
import '@event/colors.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { Endpoints } from '@/libs/endpoints';
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
  const { locale } = await props.params;

  if (!isEventLocale(EVENT_CONFIG, locale)) {
    return notFound();
  }

  const translations = await loadTranslations(locale);
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

export async function generateStaticParams() {
  return EVENT_CONFIG.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const { locale } = await params;

  if (!isEventLocale(EVENT_CONFIG, locale)) {
    return notFound();
  }

  const translations = await loadTranslations(locale);

  return (
    <html lang={locale} className="min-h-full bg-event-light">
      <body className={`${inter.className} min-h-dvh flex flex-col text-event-dark`}>
        <QueryProvider>
          <Header translations={translations} locales={EVENT_CONFIG.locales} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 flex flex-col container max-w-(--breakpoint-2xl) mx-auto p-4 w-full">
              {children}
            </main>
            <Footer translations={translations} />
          </div>
          <Client locale={locale} event={EVENT_CONFIG} />
        </QueryProvider>
      </body>
    </html>
  );
}
