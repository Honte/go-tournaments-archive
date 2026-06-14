import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAvailableTournaments, getTournament, getTournaments } from '@/data';
import { getTournamentDescription } from '@/data/description';
import { TournamentPage } from '@/components/pages/TournamentPage';

type PageProps = {
  params: Promise<{
    year: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const tournament = await getTournament(Number(year));
  const t = getTranslator(translations);

  return {
    title: `${t('site.name')} - ${tournament?.year}`,
    description: t('site.yearDescription', String(tournament?.year)),
  };
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();
  const tournaments = await getTournaments();

  return tournaments
    .map((tournament) =>
      event.locales.map((locale) => ({
        locale,
        year: String(tournament.year),
      }))
    )
    .flat();
}

export default async function Edition(props: PageProps) {
  const params = await props.params;

  const { year, locale } = params;

  if (!year.match(/^\d+$/)) {
    return notFound();
  }

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const tournament = await getTournament(Number(year));
  const years = await getAvailableTournaments();
  const description = await getTournamentDescription(event, year, locale);

  if (!tournament) {
    return notFound();
  }

  return (
    <TournamentPage
      event={event}
      tournament={tournament}
      description={description}
      translations={translations}
      years={years}
    />
  );
}
