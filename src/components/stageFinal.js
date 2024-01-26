import { getTranslator } from '@/i18n/translator';

export function StageFinal({stage, players, translations}) {
  const t = getTranslator(translations)
  const {
    requiredWins,
    includePrevious = false,
    table: [winner, loser]
  } = stage;

  const result = `${winner.wins}:${loser.wins}`;
  const prev = includePrevious ? `(${winner.wins - winner.prevScore}:${loser.wins - loser.prevScore})` : '';

  return (
    <>
      <p>{t('stage.requiredWins', requiredWins)} {includePrevious ? t('stage.includePreviousWins') : ''}</p>
      <div className="bg-gray-200 p-2 my-2 md:p-3 text-lg flex items-center text-center gap-2">
        <strong>{players[winner.id].name}</strong>
        <span>&ndash;</span>
        <span>{players[loser.id].name}</span>
        <strong>{result}</strong>
        {prev && <span>{prev}</span>}
      </div>
    </>
  );
}
