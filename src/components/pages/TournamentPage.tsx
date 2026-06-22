import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getAvailableTournaments, getTournament, getTournamentList, getTranslations } from '@/data/serverApi';
import { Awarded } from '@/components/Awarded';
import { GamesList } from '@/components/GamesList';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { StageSection } from '@/components/StageSection';
import { TournamentAnnouncement } from '@/components/TournamentAnnouncement';
import { TournamentDescription } from '@/components/TournamentDescription';
import { TournamentDetails } from '@/components/TournamentDetails';

type TournamentPageProps = {
  event: EventContext;
  locale: Locale;
  year: string;
};

export async function TournamentPage({ event, locale, year }: TournamentPageProps) {
  if (!year.match(/^\d+$/)) {
    return notFound();
  }

  const translations = await getTranslations(event, locale);
  const tournament = await getTournament(event, Number(year));
  const years = await getAvailableTournaments(event);

  if (!tournament) {
    return notFound();
  }

  const { games, players, stages, displayReversed = true, description } = tournament;
  const stagesToDisplay = displayReversed ? stages.toReversed() : stages;

  return (
    <>
      <TopNavigation event={event} locale={locale} years={years} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-1">
        <TournamentDetails event={event} tournament={tournament} translations={translations} />
        <Awarded event={event} tournament={tournament} translations={translations} />
      </div>

      <TournamentDescription description={description} locale={locale} />
      <TournamentAnnouncement tournament={tournament} translations={translations} />

      {stagesToDisplay.map((stage, index) => (
        <StageSection
          key={index}
          event={event}
          stage={stage}
          games={games}
          players={players}
          translations={translations}
        />
      ))}

      <GamesList event={event} tournament={tournament} translations={translations} />
    </>
  );
}

export async function getTournamentPageMetadata({ event, locale, year }: TournamentPageProps) {
  const translations = await getTranslations(event, locale);
  const tournament = await getTournament(event, Number(year));
  const t = getTranslator(translations);

  return {
    title: `${t('site.name')} - ${tournament?.year}`,
    description: t('site.yearDescription', String(tournament?.year)),
  };
}

export async function getTournamentPageOptions(event: EventContext) {
  const tournaments = await getTournamentList(event);

  return tournaments
    .map((tournament) =>
      event.locales.map((locale) => ({
        locale,
        year: String(tournament.year),
      }))
    )
    .flat();
}
