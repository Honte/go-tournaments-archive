import { Results } from '@/components/results';
import { getTranslations } from '@/i18n/server';
import { StageDetails } from '@/components/stageDetails';
import { Game } from '@/components/game';

export async function League({ stage, players, games, locale }) {
  const t = await getTranslations(locale);

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('stage.league')}</h2>
      <StageDetails stage={stage} locale={locale}/>
      <Results stage={stage} players={players} locale={locale} games={games}/>

      {stage.rounds.map((round, index) => (<div key={index} className="my-5">
        <h4 className="text-l font-bold border-b-pgc-dark border-b">{t('table.round', { round: index + 1})}</h4>
        {round.map((game) => <Game key={game} game={games[game]} t={t} players={players}/>)}
      </div>))}
    </div>
  );
}
