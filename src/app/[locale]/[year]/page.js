import { notFound } from 'next/navigation';
import { getTournaments } from '@/data';
import { TournamentDetails } from '@/components/tournamentDetails';
import { Awarded } from '@/components/awarded';
import { loadTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { TopNavigation } from '@/components/navigation/top';
import { StageDetails } from '@/components/stageDetails';
import { getStageName } from '@/libs/stage';
import { GamesList } from '@/components/gamesList';
import { StageResults } from '@/components/stageResults';

export async function generateMetadata({params: {year, locale}}) {
  const translations = await loadTranslations(locale);
  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => t.year === Number(year));
  const t = getTranslator(translations);

  return {
    title: `${t('site.name')} - ${tournament.year}`,
    description: t('site.yearDescription', tournament.year)
  };
}

export async function generateStaticParams() {
  const tournaments = await getTournaments();

  return tournaments.map((tournament) => SUPPORTED_LOCALES.map((locale) => ({
    locale,
    year: String(tournament.year)
  }))).flat();
}

export default async function Edition({params: {year, locale}}) {
  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  const translations = await loadTranslations(locale);
  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => t.year === Number(year));
  const {games, players, stages} = tournament;

  return (
    <>
      <TopNavigation locale={locale} tournaments={tournaments} current={Number(year)}/>

      <div className="sm:flex sm:gap-8 my-1">
        <TournamentDetails tournament={tournament} translations={translations}/>
        <Awarded tournament={tournament} translations={translations}/>
      </div>

      {stages.toReversed().map((stage) => (
        <div key={stage.type} className="my-4">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{getStageName(stage, translations)}</h2>
          <StageDetails stage={stage} translations={translations}/>
          <StageResults stage={stage} games={games} players={players} translations={translations}/>
        </div>
      ))}

      <GamesList tournament={tournament} translations={translations}/>
    </>
  );
}
