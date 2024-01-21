import { notFound } from 'next/navigation';
import { getTournaments } from '@/data';
import { League } from '@/components/league';
import { TournamentDetails } from '@/components/tournamentDetails';
import { Awarded } from '@/components/awarded';
import { StageFinal } from '@/components/stageFinal';
import { Ladder } from '@/components/ladder';
import { loadTranslations, SUPPORTED_LOCALES } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { RoundRobin } from '@/components/roundRobin';
import { TopNavigation } from '@/components/topNavigation';

export async function generateMetadata({params: {year, locale}}) {
  const translations = await loadTranslations(locale);
  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => t.year === Number(year));
  const t = getTranslator(translations);

  return {
    title: t('site.name'),
    description: t('site.description')
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
  const {games, players} = tournament;

  return (
    <>
      <TopNavigation locale={locale} tournaments={tournaments} current={Number(year)}/>

      <div className="sm:flex sm:gap-8 my-4">
        <TournamentDetails tournament={tournament} translations={translations}/>
        <Awarded tournament={tournament} translations={translations}/>
      </div>

      {tournament.stages.toReversed().map((stage) => {
        switch (stage.type) {
          case 'league':
            return <League stage={stage} translations={translations} games={games} players={players}/>;
          case 'ladder-table':
            return <Ladder stage={stage} translations={translations} games={games} players={players}/>;
          case 'final':
            return <StageFinal stage={stage} translations={translations} games={games} players={players}/>;
          case 'round-robin-table':
            return <RoundRobin stage={stage} translations={translations} games={games} players={players}/>;
          default:
            return (
              <div className="my-4">
                <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">Stage {stage.type}</h2>
              </div>
            );
        }
      })}
    </>
  );
}
