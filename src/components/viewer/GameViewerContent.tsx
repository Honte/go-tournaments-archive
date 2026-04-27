import type { SgfData } from '@/hooks/useSgfData';
import { clsx } from 'clsx';
import { type ReactNode, useEffect, useState } from 'react';
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
import { Stone } from '@/components/Stone';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';
import type { GameViewerPayload, GameViewerPlayer } from '@/components/viewer/schema';

type GameViewerContentProps = {
  sgf: SgfData;
  payload: GameViewerPayload;
  translations: Translations;
  onClose: () => void;
};

export function GameViewerContent(props: GameViewerContentProps) {
  const { sgf, payload, translations, onClose } = props;
  const t = getTranslator(translations);
  const [slider, setSlider] = useState(100);
  const [playing, setPlaying] = useState(false);
  const komi = sgf.komi ?? (payload.komi !== undefined ? String(payload.komi) : '?');
  const image = payload.props.svg ?? payload.props.png ?? payload.props.jpg;

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      setSlider((value) => {
        if (value >= 99) {
          setPlaying(false);
          return 100;
        }

        return value + 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [playing]);

  const togglePlay = () => {
    setPlaying((playing) => {
      if (playing) {
        return false;
      }

      if (slider >= 100) {
        setSlider(0);
      }

      return true;
    });
  };

  return (
    <div className="flex min-h-0 flex-col gap-2 p-2 md:flex-1 md:p-2 md:px-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {t('game.komi')}: {komi}
        </span>
        <span>{t('game.prisoners')}</span>
      </div>

      <div className="flex flex-col gap-1">
        <PlayerRow player={payload.black} color="black" locale={translations.locale} onNavigate={onClose} />
        <PlayerRow player={payload.white} color="white" locale={translations.locale} onNavigate={onClose} />
      </div>

      {image && (
        <div className="flex aspect-square min-h-0 w-full items-center justify-center md:aspect-auto md:flex-1">
          <img src={image} alt={payload.title} className="h-full w-full object-contain" />
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        <ControlButton label="First" icon={<FaBackwardFast />} />
        <ControlButton label="Back 10" icon={<FaBackward />} />
        <ControlButton label="Previous" icon={<FaBackwardStep />} />
        <ControlButton
          label={playing ? 'Pause' : 'Play'}
          icon={playing ? <FaPause /> : <FaPlay />}
          onClick={togglePlay}
        />
        <ControlButton label="Next" icon={<FaForwardStep />} />
        <ControlButton label="Forward 10" icon={<FaForward />} />
        <ControlButton label="End" icon={<FaForwardFast />} />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={(event) => {
          const value = Number(event.target.value);
          setSlider(value);

          if (value >= 100) {
            setPlaying(false);
          }
        }}
        className="h-6 w-full cursor-pointer appearance-none bg-transparent accent-event-dark [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-event-dark [&::-moz-range-thumb]:bg-event-dark [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-event-soft [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-event-dark [&::-webkit-slider-thumb]:bg-event-dark"
      />
    </div>
  );
}

function PlayerRow({
  player,
  color,
  locale,
  onNavigate,
}: {
  player: GameViewerPlayer;
  color: 'black' | 'white';
  locale: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Stone color={color} className="size-5" />
      <PlayerLink playerId={player.id} locale={locale} onClick={onNavigate} className="min-w-0 truncate font-semibold">
        <PlayerName player={player} />
      </PlayerLink>
      <span className="ml-auto font-semibold">0</span>
    </div>
  );
}

function ControlButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex p-2 cursor-default items-center justify-center rounded-sm bg-gray-300 text-event-dark',
        onClick && 'cursor-pointer hover:bg-gray-400'
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
