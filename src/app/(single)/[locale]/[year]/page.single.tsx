import type { Metadata } from 'next';
import { loadSingleEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { getTournamentPageMetadata, getTournamentPageOptions, TournamentPage } from '@/components/pages/TournamentPage';

type PageProps = {
  params: Promise<{
    year: string;
    locale: Locale;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { year, locale } = await params;
  const event = await loadSingleEvent();

  return <TournamentPage event={event} locale={locale} year={year} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, locale } = await params;
  const event = await loadSingleEvent();

  return getTournamentPageMetadata({ event, locale, year });
}

export async function generateStaticParams() {
  return getTournamentPageOptions(await loadSingleEvent());
}
