import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { FaSquare } from 'react-icons/fa';
import { FaSquareCheck } from 'react-icons/fa6';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
};

export function Toggle({ checked, onChange, children, className }: ToggleProps) {
  return (
    <label
      className={clsx('flex items-center gap-1 cursor-pointer text-sm hover:text-event-hover select-none', className)}
    >
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
      {checked ? <FaSquareCheck /> : <FaSquare />}
    </label>
  );
}
