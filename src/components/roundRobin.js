import { getTranslator } from '@/i18n/translator';
import { StageDetails } from '@/components/stageDetails';
import { Game } from '@/components/game';
import { RoundRobinResults } from '@/components/roundRobinResults';

export function RoundRobin({ stage, players, games, translations }) {
  const t = getTranslator(translations)

  return (
    <div className="my-4">
      <h2
        className="text-xl font-bold pb-1 my-2 border-b-pgc-dark border-b-2">{stage.name?.[translations.locale] || t('stage.league')}</h2>
      <StageDetails stage={stage} translations={translations}/>
      <RoundRobinResults stage={stage} players={players} translations={translations} games={games}/>

      <h4 className="text-l font-bold border-b-pgc-dark border-b">{t('stage.games')}</h4>
      {stage.games.map((game) => <Game key={game} game={games[game]} translations={translations} players={players}/>)}
    </div>
  );
}
