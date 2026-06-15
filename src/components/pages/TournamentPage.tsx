import type { TournamentWithDescription } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { Awarded } from '@/components/Awarded';
import { GamesList } from '@/components/GamesList';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { StageSection } from '@/components/StageSection';
import { TournamentAnnouncement } from '@/components/TournamentAnnouncement';
import { TournamentDescription } from '@/components/TournamentDescription';
import { TournamentDetails } from '@/components/TournamentDetails';

type TournamentPageProps = {
  event: EventContext;
  tournament: TournamentWithDescription;
  years: number[];
  translations: Translations;
};

export function TournamentPage({ event, tournament, translations, years }: TournamentPageProps) {
  const { year, games, players, stages, displayReversed = true, description } = tournament;
  const stagesToDisplay = displayReversed ? stages.toReversed() : stages;

  return (
    <>
      <TopNavigation event={event} locale={translations.locale} years={years} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-1">
        <TournamentDetails event={event} tournament={tournament} translations={translations} />
        <Awarded event={event} tournament={tournament} translations={translations} />
      </div>

      <TournamentDescription description={description} locale={translations.locale} />
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
