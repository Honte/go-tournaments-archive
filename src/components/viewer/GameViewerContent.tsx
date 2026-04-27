import type { SgfData } from '@/hooks/useSgfData';
import Board from '@sabaki/go-board';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaBackward,
  FaBackwardFast,
  FaBackwardStep,
  FaForward,
  FaForwardFast,
  FaForwardStep,
  FaPause,
  FaPlay,
} from 'react-icons/fa6';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { between } from '@/libs/math';
import { Stone } from '@/components/Stone';
import { Goban } from '@/components/goban/Goban';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { Slider } from '@/components/ui/Slider';
import { GameControlButton } from '@/components/viewer/GameControlButton';
import type { GameViewerPayload, GameViewerPlayer } from '@/components/viewer/schema';

type GameViewerContentProps = {
  sgf: SgfData;
  payload: GameViewerPayload;
  translations: Translations;
  onClose: () => void;
};

function GameViewerContent(props: GameViewerContentProps) {
  const { sgf, payload, translations, onClose } = props;
  const t = getTranslator(translations);
  const [position, setPosition] = useState(sgf.moves.length);
  const [playing, setPlaying] = useState(false);
  const komi = sgf.komi ?? (payload.komi !== undefined ? String(payload.komi) : '?');
  const result = sgf.result ?? (payload.result !== undefined ? String(payload.result) : '?');
  const maxMove = sgf.moves.length;

  const changePosition = useCallback(
    (value: number) => {
      setPosition((pos) => between(0, pos + value, maxMove));
    },
    [maxMove, setPosition]
  );

  const goToStart = useCallback(() => {
    setPosition(0);
  }, [setPosition]);

  const goBackTen = useCallback(() => {
    changePosition(-10);
  }, [changePosition]);

  const goBack = useCallback(() => {
    changePosition(-1);
  }, [changePosition]);

  const goNext = useCallback(() => {
    changePosition(1);
  }, [changePosition]);

  const goForwardTen = useCallback(() => {
    changePosition(10);
  }, [changePosition]);

  const goToEnd = useCallback(() => {
    setPosition(maxMove);
  }, [maxMove, setPosition]);

  const togglePlay = useCallback(() => {
    setPlaying((playing) => {
      if (playing) {
        return false;
      }

      if (position >= maxMove) {
        setPosition(0);
      }

      return true;
    });
  }, [maxMove, position, setPosition, setPlaying]);

  const onSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setPosition(value);

      if (value >= maxMove) {
        setPlaying(false);
      }
    },
    [maxMove, setPosition, setPlaying]
  );

  const board = useMemo(() => {
    let state = Board.fromDimensions(sgf.size, sgf.size);

    for (let i = 0; i < position; i++) {
      const { sign, vertex } = sgf.moves[i];

      state = state.makeMove(sign, vertex);
    }

    return state;
  }, [position, sgf.moves, sgf.size]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);

    function tick() {
      setPosition((value) => {
        if (value >= maxMove) {
          setPlaying(false);
          return maxMove;
        }

        return value + 1;
      });
    }
  }, [maxMove, playing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isKeyboardInputTarget(event.target)) {
        return;
      }

      switch (event.key) {
        case 'Home':
          event.preventDefault();
          goToStart();
          break;
        case 'End':
          event.preventDefault();
          goToEnd();
          break;
        case 'PageUp':
          event.preventDefault();
          goBackTen();
          break;
        case 'PageDown':
          event.preventDefault();
          goForwardTen();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goBack();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          break;
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          togglePlay();
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goBack, goBackTen, goForwardTen, goNext, goToEnd, goToStart, togglePlay]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:p-2 md:px-4">
      <div className="flex shrink-0 items-center justify-between text-sm font-semibold">
        <span>
          {t('game.komi')}: {komi}
        </span>
        <span>
          {t('game.result')}: {result}
        </span>
        <span>{t('game.prisoners')}</span>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <PlayerRow
          player={payload.black}
          color="black"
          locale={translations.locale}
          onNavigate={onClose}
          prisoners={board.getCaptures(1)}
        />
        <PlayerRow
          player={payload.white}
          color="white"
          locale={translations.locale}
          onNavigate={onClose}
          prisoners={board.getCaptures(-1)}
        />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <Goban
          board={board}
          mark={sgf.moves[position - 1]?.vertex}
          className="block aspect-square max-h-full max-w-full rounded-md"
        />
      </div>

      <div className="grid shrink-0 grid-cols-7 gap-1">
        <GameControlButton label={t('game.controls.first')} icon={<FaBackwardFast />} onClick={goToStart} />
        <GameControlButton label={t('game.controls.backTen')} icon={<FaBackward />} onClick={goBackTen} />
        <GameControlButton label={t('game.controls.previous')} icon={<FaBackwardStep />} onClick={goBack} />
        <GameControlButton
          label={playing ? t('game.controls.pause') : t('game.controls.play')}
          icon={playing ? <FaPause /> : <FaPlay />}
          onClick={togglePlay}
        />
        <GameControlButton label={t('game.controls.next')} icon={<FaForwardStep />} onClick={goNext} />
        <GameControlButton label={t('game.controls.forwardTen')} icon={<FaForward />} onClick={goForwardTen} />
        <GameControlButton label={t('game.controls.end')} icon={<FaForwardFast />} onClick={goToEnd} />
      </div>

      <div className="shrink-0">
        <Slider min={0} max={maxMove} value={position} onChange={onSliderChange} />
      </div>
    </div>
  );
}

export default GameViewerContent;

function isKeyboardInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.tagName === 'A'
  );
}

function PlayerRow({
  player,
  color,
  locale,
  onNavigate,
  prisoners,
}: {
  player: GameViewerPlayer;
  color: 'black' | 'white';
  locale: string;
  prisoners?: number;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Stone color={color} className="size-5" />
      <PlayerLink playerId={player.id} locale={locale} onClick={onNavigate} className="min-w-0 truncate font-semibold">
        <PlayerName player={player} />
      </PlayerLink>
      <span className="ml-auto font-semibold">{prisoners ?? 0}</span>
    </div>
  );
}
