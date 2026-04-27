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
        'inline-flex p-2 cursor-default items-center justify-center rounded-sm bg-gray-300 text-event-dark outline-none',
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
