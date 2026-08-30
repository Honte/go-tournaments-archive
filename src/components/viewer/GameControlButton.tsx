import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type GameControlButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
};

export function GameControlButton({ label, icon, onClick }: GameControlButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex p-2 cursor-default items-center justify-center rounded-sm bg-archive-control text-archive-text outline-none',
        onClick && 'cursor-pointer hover:bg-archive-control-hover'
      )}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
