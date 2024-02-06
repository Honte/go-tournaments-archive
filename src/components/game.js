import { useMemo } from 'react';
import { getTranslator } from '@/i18n/translator';
import { Stone } from '@/components/stone';
import { ExternalButton } from '@/components/ui/externalButton';

export function Game({ game, players, translations, wide = true }) {
  const t = getTranslator(translations);
  const [home, away] = useMemo(() => game.players.map((p) => ({ ...players[p.id], ...p })), [game, players]);

  return (
    <div className={`my-4 md:my-2 ${wide ? 'md:flex md:gap-3' : ''} items-center`}>
      <div className={wide ? 'md:flex md:gap-3 md:my-0' : ''}>
        <PlayerRow t={t} player={home}/>
        <div className={`hidden ${wide ? 'md:block' : ''}`}>&ndash;</div>
        <PlayerRow t={t} player={away}/>
      </div>
      <div className="flex gap-2 mt-1">
        {game.props.sgf && <ExternalButton url={game.props.sgf} title={t('game.sgf')}>SGF</ExternalButton>}
        {game.props.ogs && <ExternalButton url={game.props.ogs} title={t('game.ogs')}>OGS</ExternalButton>}
        {game.props.ai && <ExternalButton url={game.props.ai} title={t('game.ai')}>AI</ExternalButton>}
        {game.props.yt && <ExternalButton url={game.props.yt} title={t('game.yt')}>YT</ExternalButton>}
      </div>
    </div>
  );
}

function PlayerRow({ player, t }) {
  const color = player.color ? <Stone color={player.color} className={`h-4 inline`}/> : '';
  const name = player.id === 'BYE' ? 'BYE' : `${player.name} (${player.rank})`;

  return (
    <div className={`flex items-center gap-1 text-l ${player.won ? 'font-bold' : ''}`}>
      {color} {name} {player.won && player.score ? <PlayerScore score={player.score} t={t}/> : ''}
    </div>
  );
}

function PlayerScore({ score, t }) {
  if (score === '!') {
    return `+ ${t('game.walkover')}`;
  }

  if (score === 'R') {
    return <abbr className="cursor-help" title={t('game.resign')}>+R</abbr>
  }

  if (score === 'T') {
    return <abbr className="cursor-help" title={t('game.time')}>+T</abbr>
  }

  return `+${score}`;
}
