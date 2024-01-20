import { getTranslator } from '@/i18n/translator';
import { StageDetails } from '@/components/stageDetails';
import { Game } from '@/components/game';
import { LadderResults } from '@/components/ladderResults';

export function Ladder({ stage, players, games, translations }) {
  const t = getTranslator(translations)

  return (
    <div className="my-4">
      <h2 className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{t('stage.ladder')}</h2>
      <StageDetails stage={stage} translations={translations}/>
      <LadderResults stage={stage} players={players} translations={translations} games={games}/>

      {stage.rounds.map((round, index) => (<div key={index} className="my-5">
        <h4 className="text-l font-bold border-b-pgc-dark border-b">{t('table.round', index + 1)}</h4>
        {round.map((game) => <Game key={game} game={games[game]} translations={translations} players={players}/>)}
      </div>))}

      {stage.playoffs?.length ? <div className="my-5">
        <h4 className="text-l font-bold border-b-pgc-dark border-b">{t('table.playoffs')}</h4>
        {stage.playoffs.map((game) => <Game key={game} game={games[game]} translations={translations} players={players}/>)}
      </div> : ''}
    </div>
  );
}
