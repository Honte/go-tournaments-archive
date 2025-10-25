import { Inter } from 'next/font/google';
import { loadTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Client } from '@/components/Client';
import { LocaleNavigation } from '@/components/navigation/LocaleNavigation';
import { getTranslator } from '@/i18n/translator';

import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(props) {
  const params = await props.params;

  const { locale } = params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
  };
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ params, children }) {
  const { locale } = await params;
  const translations = await loadTranslations(locale);

  return (
    <html lang={locale} className="h-full bg-pgc-light" style={{ scrollbarGutter: 'stable' }}>
      <body className={`${inter.className} h-full flex flex-col text-pgc-dark`}>
        <LocaleNavigation locale={locale} />
        <Header translations={translations} />
        <main className="flex-1 container max-w-(--breakpoint-2xl) mx-auto p-4">{children}</main>
        <Footer translations={translations} />
        <Client rawTranslations={JSON.stringify(translations)} />
      </body>
    </html>
  );
}
