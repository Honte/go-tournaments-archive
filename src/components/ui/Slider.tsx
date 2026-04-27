import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

export function Slider(props: ComponentProps<'input'>) {
  const { min = 0, max = 100, value, onChange, className } = props;

  return (
    <div className="flex items-center gap-2">
      <input
        {...props}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={clsx(
          `h-6 w-full cursor-pointer appearance-none bg-transparent accent-event-dark
        [&::-moz-range-thumb]:size-5
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:border-2
        [&::-moz-range-thumb]:border-event-dark
        [&::-moz-range-thumb]:bg-event-dark
        [&::-webkit-slider-runnable-track]:h-1.5
        [&::-webkit-slider-runnable-track]:rounded-full
        [&::-webkit-slider-runnable-track]:bg-event-soft
        [&::-webkit-slider-thumb]:-mt-1.75
        [&::-webkit-slider-thumb]:size-5
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:border-2
        [&::-webkit-slider-thumb]:border-event-dark
        [&::-webkit-slider-thumb]:bg-event-dark`,
          className
        )}
      />
      <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-event-dark text-nowrap">{`${value} / ${max}`}</span>
    </div>
  );
}
