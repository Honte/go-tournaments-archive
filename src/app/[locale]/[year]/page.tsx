import { getAvailableTournaments, getTournament, getTournaments } from '@/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { SUPPORTED_LOCALES, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getStageName } from '@/libs/stage';
import { Awarded } from '@/components/Awarded';
import { GamesList } from '@/components/GamesList';
import { StageDetails } from '@/components/StageDetails';
import { StageResults } from '@/components/StageResults';
import { TournamentDescription } from '@/components/TournamentDescription';
import { TournamentDetails } from '@/components/TournamentDetails';
import { TopNavigation } from '@/components/navigation/TopNavigation';

type PageProps = {
  params: Promise<{
    year: string;
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, locale } = await params;

  const translations = await loadTranslations(locale);
  const tournament = await getTournament(Number(year));
  const t = getTranslator(translations);

  return {
    title: `${t('site.name')} - ${tournament?.year}`,
    description: t('site.yearDescription', String(tournament?.year)),
  };
}

export async function generateStaticParams() {
  const tournaments = await getTournaments();

  return tournaments
    .map((tournament) =>
      SUPPORTED_LOCALES.map((locale) => ({
        locale,
        year: String(tournament.year),
      }))
    )
    .flat();
}

export default async function Edition(props: PageProps) {
  const params = await props.params;

  const { year, locale } = params;

  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  const translations = await loadTranslations(locale);
  const tournament = await getTournament(Number(year));
  const years = await getAvailableTournaments();

  if (!tournament) {
    return notFound();
  }

  const { games, players, stages, displayReversed = true } = tournament;
  const stagesToDisplay = displayReversed ? stages.toReversed() : stages;

  return (
    <>
      <TopNavigation locale={locale} years={years} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-1">
        <TournamentDetails tournament={tournament} translations={translations} />
        <Awarded tournament={tournament} translations={translations} />
      </div>

      <TournamentDescription tournament={tournament} translations={translations} />

      {stagesToDisplay.map((stage, index) => (
        <div key={index} className="my-4">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-event-dark border-b-2">
            {getStageName(stage, translations)}
          </h2>
          <StageDetails stage={stage} translations={translations} />
          <StageResults stage={stage} games={games} players={players} translations={translations} />
        </div>
      ))}

      <GamesList tournament={tournament} translations={translations} />
    </>
  );
}
