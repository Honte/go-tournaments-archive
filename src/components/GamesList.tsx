import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Endpoints } from '@/libs/endpoints';
import { getStageName } from '@/libs/stage';
import { Game } from '@/components/Game';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H2 } from '@/components/ui/H2';

type GamesListProps = {
  tournament: Tournament;
  translations: Translations;
  hideGamesWithoutSgf?: boolean;
  hasZips?: boolean;
};

type GameGroup = {
  stage?: string;
  name: string;
  games: string[];
  komi?: number;
};

export function GamesList({ tournament, translations, hideGamesWithoutSgf, hasZips }: GamesListProps) {
  const { stages, games, players } = tournament;
  const t = getTranslator(translations);
  const gamesFilter = hideGamesWithoutSgf ? (game: string) => !!games[game]?.props?.sgf : () => true;

  const list = stages.toReversed().reduce<GameGroup[]>((list, stage) => {
    const name = getStageName(stage, translations);

    switch (stage.type) {
      case 'tournament':
      case 'league':
      case 'ladder-table':
        for (const [index, round] of stage.rounds.entries()) {
          const roundName = t('table.round', String(index + 1));

          list.push({
            stage: name,
            name: roundName,
            games: round.filter(gamesFilter),
          });
        }

        if (stage.type === 'ladder-table' && stage.playoffs?.length) {
          const playoffName = t('table.playoffs');

          list.push({
            stage: name,
            name: playoffName,
            games: stage.playoffs.filter(gamesFilter),
          });
        }

        break;
      case 'round-robin-table':
      case 'final':
        list.push({
          stage: name,
          name,
          games: stage.games.filter(gamesFilter),
        });
        break;
      case 'classification':
        break;
      default:
        throw new Error('Unrecognized stage type');
    }

    return list.filter((stage) => stage.games.length);
  }, []);

  if (!list.length) {
    return null;
  }

  return (
    <div className="my-4">
      <H2 className="flex items-center justify-between gap-3">
        <span>{t('stage.games')}</span>
        {hasZips && tournament.hasSgfs && (
          <ExternalLink href={Endpoints.GAMES_ZIP(tournament.year)} download title={t('game.downloadAllSgfs')}>
            <Button className="text-sm">ZIP</Button>
          </ExternalLink>
        )}
      </H2>
      {list.map((list, index) => (
        <div key={index} className="my-5">
          <h4 className="text-l font-bold border-b-event-dark border-b">
            {stages.length > 1 && list.stage ? <>{list.stage} &ndash; </> : ''}
            {list.name}
          </h4>
          <div className="max-md:flex max-md:flex-col md:grid md:grid-cols-2 gap-4 py-2 xl:py-4">
            {list.games.map((game, gameIndex) => (
              <Game
                className="w-full"
                key={game}
                game={games[game]}
                translations={translations}
                players={players}
                title={`${t('site.acronym')} ${tournament.year} - ${list.name} - ${t('table.game', String(gameIndex + 1))}`}
                wide={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
