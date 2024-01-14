import { Inter } from 'next/font/google'
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { getTranslations, SUPPORTED_LOCALES } from '@/i18n/server';

const inter = Inter({ subsets: ['latin'] })

import '../globals.css'
import { Footer } from '@/components/footer';

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
  return (
    <html lang={locale} className="h-full bg-pgc-light" style={{scrollbarGutter: 'stable'}}>
      <body className={`${inter.className} h-full flex flex-col text-pgc-dark`}>
        <Header locale={locale}/>
        <main className="flex-1 container mx-auto p-2">
          {children}
        </main>
        <Footer locale={locale}/>
      </body>
    </html>
  )
}
