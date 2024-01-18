import { Inter } from 'next/font/google'
import { getRawTranslations, getTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Client } from '@/components/client';

import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata({ params: { locale }}) {
  const t = await getTranslations(locale)

  return {
    title: t('site.name'),
    description: t('site.description')
  }
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params: { locale } }) {
  const translations = await getRawTranslations(locale);

  return (
    <html lang={locale} className="h-full bg-pgc-light" style={{scrollbarGutter: 'stable'}}>
      <body className={`${inter.className} h-full flex flex-col text-pgc-dark`}>
        <Header locale={locale}/>
        <main className="flex-1 container max-w-screen-2xl mx-auto p-4">
          {children}
        </main>
        <Footer locale={locale}/>
        <Client locale={locale} translations={translations}/>
      </body>
    </html>
  )
}
