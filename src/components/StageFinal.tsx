import type { FinalStage, Game, Player } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameResultLabel } from '@/components/GameResultLabel';
import { Stone } from '@/components/Stone';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { GameViewerButton } from '@/components/viewer/GameViewerButton';

type StageFinalProps = {
  event: EventContext;
  stage: FinalStage;
  games: Record<string, Game>;
  players: Record<string, Player>;
  translations: Translations;
};

export function StageFinal({ event, stage, games, players, translations }: StageFinalProps) {
  const t = getTranslator(translations);
  const {
    requiredWins,
    includePrevious = false,
    table: [winner, loser],
  } = stage;

  const result = `${winner.wins}:${loser.wins}`;
  const tied = winner.wins === loser.wins;
  const prev = includePrevious
    ? `(${winner.wins - (winner.prevScore ?? 0)}:${loser.wins - (loser.prevScore ?? 0)})`
    : '';
  const winnerPlayer = players[winner.id];
  const loserPlayer = players[loser.id];
  const sgfGames = stage.games.map((game) => games[game]).filter((game): game is Game => !!game?.props.sgf);

  return (
    <div className="flex flex-col gap-2">
      <p>
        {t('stage.requiredWins', String(requiredWins))} {includePrevious ? t('stage.includePreviousWins') : ''}
      </p>
      <div className="text-lg flex items-center gap-2 flex-wrap">
        <span className={tied ? undefined : 'font-bold'}>
          <PlayerLink event={event} playerId={winnerPlayer.id} locale={translations.locale}>
            <PlayerName player={winnerPlayer} showCountry={event.showCountry} />
          </PlayerLink>
        </span>
        <span>&ndash;</span>
        <span>
          <PlayerLink event={event} playerId={loserPlayer.id} locale={translations.locale}>
            <PlayerName player={loserPlayer} showCountry={event.showCountry} />
          </PlayerLink>
        </span>
        <strong>{result}</strong>
        {prev && <span>{prev}</span>}
      </div>
      {sgfGames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sgfGames.map((game) => (
            <FinalSgfGame key={game.id} game={game} players={players} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function FinalSgfGame({ game, players, t }: { game: Game; players: Record<string, Player>; t: Translator }) {
  const winner = game.players.find((player) => player.won);

  if (!game.draw) {
    return (
      <GameViewerButton sgfPath={game.props.sgf!} className="flex text-sm items-center px-3 py-1">
        <GameResultLabel result={game.result} t={t} />
      </GameViewerButton>
    );
  }

  if (!winner) {
    return null;
  }

  return (
    <GameViewerButton sgfPath={game.props.sgf!} className="flex text-sm items-center px-3 py-1">
      <span className="mr-1">{players[winner.id]?.name}:</span>
      {winner.color && <Stone color={winner.color} className="size-4" />}
      {winner.score ? `+${winner.score}` : '+?'}
    </GameViewerButton>
  );
}
