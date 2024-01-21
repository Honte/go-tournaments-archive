import { getTranslator } from '@/i18n/translator';

export function StageFinal({stage, players, translations}) {
  const t = getTranslator(translations)
  const {
    requiredWins,
    includePrevious = false,
    summary: {
      winner,
      loser,
      score,
      previous
    }
  } = stage;

  const result = `${score[winner]}:${score[loser]}`;
  const prev = includePrevious ? `(${score[winner] - Number(previous === winner)}:${score[loser] - Number(previous === loser)})` : '';

  return (
    <>
      <p>{t('stage.requiredWins', requiredWins)} {includePrevious ? t('stage.includePreviousWins') : ''}</p>
      <div className="bg-gray-200 p-2 my-2 md:p-3 text-lg flex items-center text-center gap-2">
        <strong>{players[winner].name}</strong>
        <span>&ndash;</span>
        <span>{players[loser].name}</span>
        <strong>{result}</strong>
        {prev && <span>{prev}</span>}
      </div>
    </>
  );
}
