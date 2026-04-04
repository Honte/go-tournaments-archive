import type { FinalStage, Player } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { PlayerLink } from '@/components/ui/PlayerLink';

type StageFinalProps = {
  stage: FinalStage;
  players: Record<string, Player>;
  translations: Translations;
};

export function StageFinal({ stage, players, translations }: StageFinalProps) {
  const t = getTranslator(translations);
  const {
    requiredWins,
    includePrevious = false,
    table: [winner, loser],
  } = stage;

  const result = `${winner.wins}:${loser.wins}`;
  const prev = includePrevious
    ? `(${winner.wins - (winner.prevScore ?? 0)}:${loser.wins - (loser.prevScore ?? 0)})`
    : '';

  return (
    <>
      <p>
        {t('stage.requiredWins', String(requiredWins))} {includePrevious ? t('stage.includePreviousWins') : ''}
      </p>
      <div className="bg-gray-200 p-2 my-2 md:p-3 text-lg flex items-center text-center gap-2">
        <strong>
          <PlayerLink player={players[winner.id]} translations={translations} />
        </strong>
        <span>&ndash;</span>
        <span>
          <PlayerLink player={players[loser.id]} translations={translations} />
        </span>
        <strong>{result}</strong>
        {prev && <span>{prev}</span>}
      </div>
    </>
  );
}
