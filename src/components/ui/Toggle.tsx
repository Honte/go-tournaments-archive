import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { FaSquare } from 'react-icons/fa';
import { FaSquareCheck } from 'react-icons/fa6';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, children, className, disabled }: ToggleProps) {
  return (
    <label
      className={clsx('flex items-center gap-1 text-sm select-none', className, {
        'cursor-pointer hover:text-archive-link-hover': !disabled,
        'cursor-not-allowed opacity-45': disabled,
      })}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {children}
      {checked ? <FaSquareCheck /> : <FaSquare />}
    </label>
  );
}
