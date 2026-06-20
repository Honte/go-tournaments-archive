import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { AllPlayersPage, getAllPlayersPageMetadata, getAllPlayersPageOptions } from '@/components/pages/AllPlayersPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const event = await loadDefaultEvent();

  return <AllPlayersPage event={event} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const event = await loadDefaultEvent();

  return getAllPlayersPageMetadata({ event, locale });
}

export async function generateStaticParams() {
  return getAllPlayersPageOptions(await loadDefaultEvent());
}
