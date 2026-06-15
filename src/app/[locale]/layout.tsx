import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { loadDefaultEvent } from '@/events';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { appleIconUrl, faviconUrl } from '@/libs/urls';
import { Layout } from '@/components/pages/Layout';

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
    <Layout event={event} translations={translations}>
      {children}
    </Layout>
  );
}
