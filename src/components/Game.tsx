import { clsx } from 'clsx';
import { useMemo } from 'react';
import { type Game, type GamePlayer, type Participant } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getParticipantName } from '@/libs/participants';
import { gameThumbUrl } from '@/libs/urls';
import { GameActions } from '@/components/GameActions';
import { Stone } from '@/components/Stone';
import { PlayerCell } from '@/components/ui/PlayerCell';
import { GameViewerTrigger } from '@/components/viewer/GameViewerTrigger';

type GameProps = {
  event: EventContext;
  game: Game;
  title: string;
  className?: string;
  players: Record<string, Participant>;
  translations: Translations;
  wide?: boolean;
};

export function Game({ event, className, game, players, translations, title, wide }: GameProps) {
  const t = getTranslator(translations);
  const [home, away] = useMemo(() => game.players.map((p) => ({ ...players[p.id], ...p })), [game, players]);
  const hasSgf = event.generateSgfs && game.props.sgf;
  const hasProps = Object.keys(game.props).length > 0;
  const preview = game.props.jpg ?? game.props.svg ?? game.props.png;
  const gameTitle = t('game.preview', `${title}: ${getParticipantName(home)} vs ${getParticipantName(away)}`);

  return (
    <div
      className={clsx(`flex ${className} gap-2 md:gap-4 md:items-center`, {
        'max-xs:flex-wrap': wide,
        'max-xs:flex-col': !wide,
      })}
    >
      {hasSgf && preview && (
        <GameViewerTrigger
          sgfPath={game.props.sgf!}
          aria-label={gameTitle}
          className="h-fit shrink-0 max-xs:self-start"
        >
          <img src={gameThumbUrl(event, preview)} alt={gameTitle} className="size-20" loading="lazy" />
        </GameViewerTrigger>
      )}
      <div
        className={clsx('flex flex-col', {
          'underline decoration-dotted cursor-help': game.draw,
        })}
        title={game.draw ? t('game.draw') : undefined}
      >
        <div
          className={clsx('flex justify-center', {
            'flex-col': hasSgf || !wide,
            'max-xs:flex-col gap-1 sm:items-center': !hasSgf,
          })}
        >
          <PlayerRow event={event} locale={translations.locale} t={t} player={home} />
          {!hasSgf && wide && <div className="max-xs:hidden">&ndash;</div>}
          <PlayerRow event={event} locale={translations.locale} t={t} player={away} />
        </div>
        {hasProps && <GameActions event={event} props={game.props} t={t} showViewer={true} />}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  t,
  event,
  locale,
}: {
  player: GamePlayer & Participant;
  t: Translator;
  event: EventContext;
  locale: string;
}) {
  const color = player.color ? <Stone color={player.color} className={`h-4 inline`} /> : '';
  const name = player.id === 'BYE' ? 'BYE' : <PlayerCell event={event} player={player} locale={locale} />;

  return (
    <div className={`flex items-center gap-1 text-l ${player.won ? 'font-bold' : ''}`}>
      {color} {name} {player.won && player.score ? <PlayerScore score={player.score} t={t} /> : ''}
    </div>
  );
}

function PlayerScore({ score, t }: { score: string; t: Translator }) {
  if (score === '!') {
    return `+ ${t('game.walkover')}`;
  }

  if (score === 'R') {
    return (
      <abbr className="cursor-help" title={t('game.resign')}>
        +R
      </abbr>
    );
  }

  if (score === 'T') {
    return (
      <abbr className="cursor-help" title={t('game.time')}>
        +T
      </abbr>
    );
  }

  return `+${score}`;
}
