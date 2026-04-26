import { type Game, type GamePlayer, type Player } from '@/schema/data';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import type { Translations, Translator } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { GameActions } from '@/components/GameActions';
import { Stone } from '@/components/Stone';

type GameProps = {
  className?: string;
  game: Game;
  players: Record<string, Player>;
  translations: Translations;
  wide?: boolean;
};

export function Game({ className, game, players, translations, wide }: GameProps) {
  const t = getTranslator(translations);
  const [home, away] = useMemo(() => game.players.map((p) => ({ ...players[p.id], ...p })), [game, players]);
  const hasSgf = game.props.sgf;
  const hasProps = Object.keys(game.props).length > 0;

  return (
    <div
      className={clsx(`flex ${className} gap-2 md:gap-4 md:items-center`, {
        'max-xs:flex-wrap': wide,
        'max-xs:flex-col': !wide,
      })}
    >
      {hasSgf && (
        <img
          src={game.props.jpg ?? game.props.svg}
          alt={t('game.preview', `${home.name} vs ${away.name}`)}
          className="size-20"
          loading="lazy"
        />
      )}
      <div className="flex flex-col">
        <div
          className={clsx('flex justify-center', {
            'flex-col': hasSgf || !wide,
            'max-xs:flex-col gap-1 sm:items-center': !hasSgf,
          })}
        >
          <PlayerRow t={t} player={home} />
          {!hasSgf && wide && <div className="max-xs:hidden">&ndash;</div>}
          <PlayerRow t={t} player={away} />
        </div>
        {hasProps && <GameActions props={game.props} t={t} />}
      </div>
    </div>
  );
}

function PlayerRow({ player, t }: { player: GamePlayer & Player; t: Translator }) {
  const color = player.color ? <Stone color={player.color} className={`h-4 inline`} /> : '';
  const name = player.id === 'BYE' ? 'BYE' : `${player.name} (${player.rank})`;

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
