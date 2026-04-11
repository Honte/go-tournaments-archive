import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getStageName } from '@/libs/stage';
import { Game } from '@/components/Game';
import { H2 } from '@/components/ui/H2';

type GamesListProps = {
  tournament: Tournament;
  translations: Translations;
};

type GameGroup = {
  stage?: string;
  name: string;
  games: string[];
};

export function GamesList({ tournament, translations }: GamesListProps) {
  const { stages, games, players } = tournament;
  const t = getTranslator(translations);

  const list = stages.toReversed().reduce<GameGroup[]>((list, stage) => {
    const name = getStageName(stage, translations);

    switch (stage.type) {
      case 'tournament':
      case 'league':
      case 'ladder-table':
        for (const [index, round] of stage.rounds.entries()) {
          list.push({
            stage: name,
            name: t('table.round', String(index + 1)),
            games: round,
          });
        }

        if (stage.type === 'ladder-table' && stage.playoffs?.length) {
          list.push({
            stage: name,
            name: t('table.playoffs'),
            games: stage.playoffs,
          });
        }

        break;
      case 'round-robin-table':
      case 'final':
        list.push({
          name,
          games: stage.games,
        });
        break;
      default:
        throw new Error('Unrecognized stage type');
    }

    return list;
  }, []);

  return (
    <div className="my-4">
      <H2>{t('stage.games')}</H2>
      {list.map((list, index) => (
        <div key={index} className="my-5">
          <h4 className="text-l font-bold border-b-event-dark border-b">
            {stages.length > 1 && list.stage ? <>{list.stage} &ndash; </> : ''}
            {list.name}
          </h4>
          <div className="max-md:flex max-md:flex-col md:grid md:grid-cols-2 gap-4 py-2 xl:py-4">
            {list.games.map((game) => (
              <Game
                className="w-full"
                key={game}
                game={games[game]}
                translations={translations}
                players={players}
                wide={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
