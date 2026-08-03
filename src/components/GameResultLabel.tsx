import type { Translator } from '@/i18n/consts';
import { JIGO } from '@/libs/games';

type GameResultLabelProps = {
  result?: string | null;
  t: Translator;
};

export function GameResultLabel({ result, t }: GameResultLabelProps) {
  if (result === JIGO) {
    return (
      <abbr className="cursor-help" title={t('game.draw')}>
        Jigo
      </abbr>
    );
  }

  return result ?? '?';
}
