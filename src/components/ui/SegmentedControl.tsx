'use client';

import { clsx } from 'clsx';

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
};

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly SegmentedControlOption<Value>[];
  onChange: (value: Value) => void;
  controlsId?: string;
  className?: string;
};

export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  controlsId,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <div role="group" aria-label={label} className={clsx('inline-flex rounded-md bg-archive-control p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-controls={controlsId}
          aria-pressed={value === option.value}
          className={clsx(
            'inline-flex cursor-pointer rounded-sm px-1.5 py-0.5 text-sm leading-4 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archive-focus-ring',
            value === option.value
              ? 'bg-archive-control-selected text-archive-control-selected-text'
              : 'text-archive-text hover:bg-archive-control-hover hover:text-archive-link-hover'
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
