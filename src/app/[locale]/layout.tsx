import '@event/colors.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';
import type { Locale } from '@/i18n/consts';
import { SUPPORTED_LOCALES, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { Client } from '@/components/Client';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { QueryProvider } from '@/components/QueryProvider';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

type RootLayoutProps = PropsWithChildren<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata(props: RootLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const translations = await loadTranslations(locale as Locale);
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

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ params, children }: RootLayoutProps) {
  const { locale } = await params;
  const translations = await loadTranslations(locale as Locale);

  return (
    <html lang={locale} className="min-h-full bg-event-light">
      <body className={`${inter.className} min-h-dvh flex flex-col text-event-dark`}>
        <QueryProvider>
          <Header translations={translations} />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 container max-w-(--breakpoint-2xl) mx-auto p-4 w-full">{children}</main>
            <Footer translations={translations} />
          </div>
          <Client locale={locale as Locale} />
        </QueryProvider>
      </body>
    </html>
  );
}
