import { getTranslations } from '@/i18n/server';
import { Game } from '@/components/game';

export async function StageFinal({stage, games, players, locale}) {
  const t = await getTranslations(locale);
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
    <div className="my-4">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('stage.final')}</h2>
      <p>{t('stage.requiredWins', {wins: requiredWins})} {includePrevious ? t('stage.includePreviousWins') : ''}</p>
      <div className="bg-gray-200 p-2 my-2 md:p-3 text-lg flex items-center text-center gap-2">
        <strong>{players[winner].name}</strong>
        <span>&ndash;</span>
        <span>{players[loser].name}</span>
        <strong>{result}</strong>
        {prev && <span>{prev}</span>}
      </div>
      {stage.games.map((game) => <Game key={game} game={games[game]} t={t} players={players}/>)}
    </div>
  );
}
