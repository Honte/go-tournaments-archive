import { notFound } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import type { EventContext } from '@/schema/event';
import { isEventLocale } from '@/i18n/locales';
import { getTranslator } from '@/i18n/translator';
import { appleIconUrl, faviconUrl } from '@/libs/urls';
import { getTranslations } from '@/data/serverApi';
import { Client } from '@/components/Client';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { QueryProvider } from '@/components/QueryProvider';

type LayoutProps = PropsWithChildren<{
  event: EventContext;
  locale: string;
}>;

export async function EventLayout({ event, locale, children }: LayoutProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);

  return (
    <QueryProvider>
      <Header event={event} translations={translations} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col container max-w-(--breakpoint-2xl) mx-auto p-4 w-full">{children}</main>
        <Footer translations={translations} />
      </div>
      <Client locale={locale} event={event} />
    </QueryProvider>
  );
}

export async function getEventLayoutMetadata({ event, locale }: LayoutProps) {
  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description'),
    icons: {
      icon: { url: faviconUrl(event), type: 'image/svg+xml' },
      apple: { url: appleIconUrl(event), type: 'image/png', sizes: '180x180' },
    },
  };
}
