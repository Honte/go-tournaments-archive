import { Inter } from 'next/font/google'
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { getTranslations, SUPPORTED_LOCALES } from '@/i18n/server';

const inter = Inter({ subsets: ['latin'] })

import '../globals.css'

export async function generateMetadata({ params: { locale }}) {
  const t = await getTranslations(locale)

  return {
    title: t('header'),
    description: 'Test'
  }
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params: { locale } }) {
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Header locale={locale}/>
        <Navigation locale={locale}/>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
