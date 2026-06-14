import type { GameProps } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translator } from '@/i18n/consts';
import { gameSgfUrl, rawGameSgfUrl } from '@/libs/urls';
import { ExternalButton } from '@/components/ui/ExternalButton';
import { GameViewerButton } from '@/components/viewer/GameViewerTrigger';

type GameActionProps = {
  event: EventContext;
  t: Translator;
  props: GameProps;
  showViewer?: boolean;
  showOriginal?: boolean;
};

export function GameActions({ event, t, props, showViewer, showOriginal = false }: GameActionProps) {
  return (
    <div className="flex gap-2 mt-1">
      {showViewer && props.sgf && <GameViewerButton sgfPath={props.sgf}>{t('game.open')}</GameViewerButton>}

      {props.sgf && (
        <ExternalButton url={gameSgfUrl(event.basePath, event.prefix, props.sgf)} title={t('game.sgf')}>
          SGF
        </ExternalButton>
      )}
      {props.sgf && showOriginal && (
        <ExternalButton url={rawGameSgfUrl(event.basePath, event.prefix, props.sgf)} title={t('game.rawSgf')}>
          {t('game.raw')}
        </ExternalButton>
      )}
      {props.ogs && (
        <ExternalButton url={props.ogs} title={t('game.ogs')}>
          OGS
        </ExternalButton>
      )}
      {props.ai && (
        <ExternalButton url={props.ai} title={t('game.ai')}>
          AI
        </ExternalButton>
      )}
      <YouTubeLink value={props.yt} t={t} />
    </div>
  );
}

function YouTubeLink({ value, t }: { value?: string | string[]; t: Translator }) {
  if (!value || !value.length) {
    return null;
  }

  const values = Array.isArray(value) ? value : [value];

  return (
    <>
      {values.map((value, index) => (
        <ExternalButton key={value} url={value} title={t('game.yt')}>
          YT{values.length > 1 ? `#${index + 1}` : ''}
        </ExternalButton>
      ))}
    </>
  );
}
