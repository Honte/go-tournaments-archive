import type { GameProps } from '@/schema/data';
import type { Translator } from '@/i18n/consts';
import { ExternalButton } from '@/components/ui/ExternalButton';
import { GameViewerButton } from '@/components/viewer/GameViewerTrigger';

type GameActionProps = {
  props: GameProps;
  showViewer?: boolean;
  t: Translator;
};

export function GameActions({ props, showViewer, t }: GameActionProps) {
  return (
    <div className="flex gap-2 mt-1">
      {showViewer && props.sgf && <GameViewerButton sgfPath={props.sgf}>{t('game.open')}</GameViewerButton>}

      {props.sgf && (
        <ExternalButton url={props.sgf} title={t('game.sgf')}>
          SGF
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
