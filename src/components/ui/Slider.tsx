import { clsx } from 'clsx';
import type { ChangeEvent, ComponentProps, InputEvent } from 'react';

export function Slider(props: ComponentProps<'input'>) {
  const { min = 0, max = 100, value, onChange, onInput, className } = props;
  const handleInput =
    onInput ??
    (onChange
      ? (event: InputEvent<HTMLInputElement>) => {
          onChange(event as unknown as ChangeEvent<HTMLInputElement>);
        }
      : undefined);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        {...props}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        onInput={handleInput}
        className={clsx(
          `h-6 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent accent-event-dark [-webkit-appearance:none]
        [&::-moz-range-progress]:h-1.5
        [&::-moz-range-progress]:rounded-full
        [&::-moz-range-progress]:bg-event-soft
        [&::-moz-range-track]:h-1.5
        [&::-moz-range-track]:rounded-full
        [&::-moz-range-track]:bg-event-soft
        [&::-moz-range-thumb]:appearance-none
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
        [&::-webkit-slider-thumb]:[-webkit-appearance:none]
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
