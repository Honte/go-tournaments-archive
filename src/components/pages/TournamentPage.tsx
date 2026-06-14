import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getStageName } from '@/libs/stage';
import { Awarded } from '@/components/Awarded';
import { GamesList } from '@/components/GamesList';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { StageDetails } from '@/components/StageDetails';
import { StageResults } from '@/components/StageResults';
import { TournamentAnnouncement } from '@/components/TournamentAnnouncement';
import { TournamentDescription } from '@/components/TournamentDescription';
import { TournamentDetails } from '@/components/TournamentDetails';

type TournamentPageProps = {
  event: EventContext;
  tournament: Tournament;
  description?: string;
  years: number[];
  translations: Translations;
};

export function TournamentPage({ event, tournament, translations, years, description }: TournamentPageProps) {
  const { year, games, players, stages, displayReversed = true } = tournament;
  const stagesToDisplay = displayReversed ? stages.toReversed() : stages;

  return (
    <>
      <TopNavigation event={event} locale={translations.locale} years={years} current={Number(year)} />

      <div className="sm:flex sm:gap-8 my-1">
        <TournamentDetails event={event} tournament={tournament} translations={translations} />
        <Awarded event={event} tournament={tournament} translations={translations} />
      </div>

      <TournamentDescription content={description} />
      <TournamentAnnouncement tournament={tournament} translations={translations} />

      {stagesToDisplay.map((stage, index) => (
        <div key={index} className="my-4">
          <h2 className="text-xl font-bold pb-1 my-2 border-b-event-dark border-b-2">
            {getStageName(stage, translations)}
          </h2>
          <StageDetails event={event} stage={stage} translations={translations} />
          <StageResults event={event} stage={stage} games={games} players={players} translations={translations} />
        </div>
      ))}

      <GamesList event={event} tournament={tournament} translations={translations} />
    </>
  );
}
