import Board from '@sabaki/go-board';
import { clsx } from 'clsx';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState, type WheelEvent } from 'react';
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
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { between } from '@/libs/math';
import type { SgfData, SgfEdit, SgfMove, SgfPlayer } from '@/libs/sgf';
import { Goban, type SgfPointer } from '@/components/goban/Goban';
import { Stone } from '@/components/Stone';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import { Slider } from '@/components/ui/Slider';
import { GameControlButton } from '@/components/viewer/GameControlButton';

type GameViewerContentProps = {
  event: EventContext;
  sgf: SgfData;
  translations: Translations;
  onClose: () => void;
};

function GameViewerContent(props: GameViewerContentProps) {
  const { event, sgf, translations, onClose } = props;
  const t = getTranslator(translations);
  const [position, setPosition] = useState(sgf.moves.length);
  const [playing, setPlaying] = useState(false);
  const [pointer, setPointer] = useState<SgfPointer | undefined>(undefined);
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

  const onBoardWheel = useCallback(
    (event: WheelEvent<SVGSVGElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.deltaY === 0) {
        return;
      }

      changePosition(Math.sign(event.deltaY));
    },
    [changePosition]
  );

  const goToMove = useCallback(
    (boardMove: SgfMove) => {
      const gameMove = findMove(sgf.moves, boardMove, position);

      if (gameMove) {
        setPosition(sgf.moves.indexOf(gameMove) + 1);
        setPlaying(false);
      }
    },
    [setPosition, setPlaying, sgf.moves, position]
  );

  const showPointer = useCallback(
    (boardMove: SgfMove, element: SVGSVGElement) => {
      const gameMove = findMove(sgf.moves, boardMove, position);

      element.style.cursor = gameMove ? 'pointer' : 'default';
      setPointer(
        gameMove && !boardMove.sign
          ? {
              sign: gameMove.sign,
              vertex: gameMove.vertex,
              hint: `#${sgf.moves.indexOf(gameMove) + 1}`,
            }
          : undefined
      );
    },
    [sgf.moves, position]
  );

  const board = useMemo(() => {
    let state = Board.fromDimensions(sgf.size, sgf.size);

    for (let i = 0; i < position; i++) {
      const move = sgf.moves[i];

      if ('vertex' in move) {
        state = state.makeMove(move.sign, move.vertex);
      } else {
        for (const vertex of move.empty) {
          state = state.set(vertex, 0);
        }

        for (const vertex of move.black) {
          state = state.set(vertex, 1);
        }

        for (const vertex of move.white) {
          state = state.set(vertex, -1);
        }
      }
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
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:px-4">
      <div className="flex shrink-0 items-center justify-between text-sm font-semibold">
        <span>
          {t('game.komi')}: {sgf.komi ?? '?'}
        </span>
        <span>
          {t('game.result')}: {sgf.result ?? '?'}
        </span>
        <span>{t('game.prisoners')}</span>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <PlayerRow
          event={event}
          player={sgf.black}
          color="black"
          locale={translations.locale}
          onNavigate={onClose}
          prisoners={board.getCaptures(1)}
        />
        <PlayerRow
          event={event}
          player={sgf.white}
          color="white"
          locale={translations.locale}
          onNavigate={onClose}
          prisoners={board.getCaptures(-1)}
        />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <Goban
          board={board}
          mark={getPrevMove(sgf.moves, position)}
          pointer={pointer}
          className="block aspect-square max-h-full max-w-full rounded-md"
          onClick={goToMove}
          onMouseMove={showPointer}
          onWheel={onBoardWheel}
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
  event,
  player,
  color,
  locale,
  prisoners,
  onNavigate,
}: {
  event: EventContext;
  player: SgfPlayer;
  color: 'black' | 'white';
  locale: string;
  prisoners?: number;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Stone color={color} className="size-5" />
      <PlayerLink
        event={event}
        playerId={player.id}
        locale={locale}
        onClick={onNavigate}
        className={clsx('min-w-0 truncate', {
          'font-semibold': player.won,
        })}
      >
        <PlayerName player={player} showCountry={event.showCountry} />
      </PlayerLink>
      <span className="ml-auto font-semibold">{prisoners ?? 0}</span>
    </div>
  );
}

function getPrevMove(moves: (SgfMove | SgfEdit)[], position: number): SgfMove | undefined {
  const prev = moves[position - 1];

  return prev && 'vertex' in prev ? prev : undefined;
}

function findMove(moves: (SgfMove | SgfEdit)[], boardMove: SgfMove, position: number): SgfMove | undefined {
  return moves.find(
    (move, index) =>
      'vertex' in move &&
      move.vertex[0] === boardMove.vertex[0] &&
      move.vertex[1] === boardMove.vertex[1] &&
      (boardMove.sign ? move.sign === boardMove.sign : index >= position)
  ) as SgfMove | undefined;
}
