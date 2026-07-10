'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

export type GameDualRangeProps = {
  id: string;
  label: string;
  minimum: number;
  maximum: number;
  lowerValue: number;
  upperValue: number;
  lowerLabel: string;
  upperLabel: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  onCommit: (lowerValue: number, upperValue: number) => void;
};

const thumbClassName = `pointer-events-none absolute inset-x-0 top-1/2 z-10 h-4 w-full -translate-y-1/2 appearance-none bg-transparent
  [&::-moz-range-track]:h-0
  [&::-moz-range-track]:bg-transparent
  [&::-moz-range-thumb]:pointer-events-auto
  [&::-moz-range-thumb]:size-4
  [&::-moz-range-thumb]:cursor-grab
  [&::-moz-range-thumb]:appearance-none
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:border-2
  [&::-moz-range-thumb]:border-event-primary
  [&::-moz-range-thumb]:bg-white
  [&::-moz-range-thumb]:shadow-sm
  [&::-moz-range-thumb]:active:cursor-grabbing
  [&::-webkit-slider-runnable-track]:h-0
  [&::-webkit-slider-runnable-track]:bg-transparent
  [&::-webkit-slider-thumb]:pointer-events-auto
  [&::-webkit-slider-thumb]:size-4
  [&::-webkit-slider-thumb]:cursor-grab
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:[-webkit-appearance:none]
  [&::-webkit-slider-thumb]:-mt-2
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:border-2
  [&::-webkit-slider-thumb]:border-event-primary
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:shadow-sm
  [&::-webkit-slider-thumb]:active:cursor-grabbing
  focus-visible:outline-none
  focus-visible:[&::-moz-range-thumb]:ring-4
  focus-visible:[&::-moz-range-thumb]:ring-event-primary
  focus-visible:[&::-moz-range-thumb]:ring-offset-1
  focus-visible:[&::-webkit-slider-thumb]:ring-4
  focus-visible:[&::-webkit-slider-thumb]:ring-event-primary
  focus-visible:[&::-webkit-slider-thumb]:ring-offset-1`;

export function GameDualRange({
  id,
  label,
  minimum,
  maximum,
  lowerValue,
  upperValue,
  lowerLabel,
  upperLabel,
  formatValue = String,
  disabled = false,
  onCommit,
}: GameDualRangeProps) {
  const normalizedLower = clamp(Math.min(lowerValue, upperValue), minimum, maximum);
  const normalizedUpper = clamp(Math.max(lowerValue, upperValue), minimum, maximum);
  const [draft, setDraft] = useState<[number, number]>([normalizedLower, normalizedUpper]);
  const draftRef = useRef(draft);

  useEffect(() => {
    const next: [number, number] = [normalizedLower, normalizedUpper];
    draftRef.current = next;
    setDraft(next);
  }, [normalizedLower, normalizedUpper]);

  const setDraftValue = useCallback((next: [number, number]) => {
    draftRef.current = next;
    setDraft(next);
  }, []);
  const commit = useCallback(() => {
    const [lower, upper] = draftRef.current;
    if (lower !== normalizedLower || upper !== normalizedUpper) {
      onCommit(lower, upper);
    }
  }, [normalizedLower, normalizedUpper, onCommit]);
  const handleLowerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const upper = draftRef.current[1];
      const next = getKeyboardValue(event.key, draftRef.current[0], minimum, upper);
      if (next === undefined) {
        return;
      }
      event.preventDefault();
      setDraftValue([next, upper]);
    },
    [minimum, setDraftValue]
  );
  const handleUpperKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const lower = draftRef.current[0];
      const next = getKeyboardValue(event.key, draftRef.current[1], lower, maximum);
      if (next === undefined) {
        return;
      }
      event.preventDefault();
      setDraftValue([lower, next]);
    },
    [maximum, setDraftValue]
  );

  const span = maximum - minimum;
  const lowerPercent = span > 0 ? ((draft[0] - minimum) / span) * 100 : 0;
  const upperPercent = span > 0 ? ((draft[1] - minimum) / span) * 100 : 100;
  const rangeDisabled = disabled || span <= 0;

  return (
    <fieldset className={rangeDisabled ? 'min-w-0 opacity-60' : 'min-w-0'} disabled={rangeDisabled}>
      <legend className="mb-1 text-sm font-semibold">{label}</legend>
      <div className="rounded-sm border border-event-soft bg-white px-3 py-2">
        <div className="relative my-2 h-4">
          <div className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-event-soft">
            <div
              className="absolute inset-y-0 rounded-full bg-event-primary"
              style={{ left: `${lowerPercent}%`, right: `${100 - upperPercent}%` }}
            />
          </div>
          <input
            id={`${id}-minimum`}
            type="range"
            min={minimum}
            max={maximum}
            value={draft[0]}
            className={`${thumbClassName} ${draft[0] === maximum ? 'z-30' : ''}`}
            aria-label={lowerLabel}
            aria-valuetext={formatValue(draft[0])}
            onKeyDown={handleLowerKeyDown}
            onChange={(event) =>
              setDraftValue([Math.min(Number(event.target.value), draftRef.current[1]), draftRef.current[1]])
            }
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
          />
          <input
            id={`${id}-maximum`}
            type="range"
            min={minimum}
            max={maximum}
            value={draft[1]}
            className={`${thumbClassName} z-20`}
            aria-label={upperLabel}
            aria-valuetext={formatValue(draft[1])}
            onKeyDown={handleUpperKeyDown}
            onChange={(event) =>
              setDraftValue([draftRef.current[0], Math.max(Number(event.target.value), draftRef.current[0])])
            }
            onPointerUp={commit}
            onKeyUp={commit}
            onBlur={commit}
          />
        </div>
        <div className="flex items-center justify-between gap-4 text-xs font-semibold tabular-nums text-event-dark">
          <output htmlFor={`${id}-minimum`} aria-live="off" className="min-w-0 text-left">
            {formatValue(draft[0])}
          </output>
          <output htmlFor={`${id}-maximum`} aria-live="off" className="min-w-0 text-right">
            {formatValue(draft[1])}
          </output>
        </div>
      </div>
    </fieldset>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getKeyboardValue(key: string, current: number, minimum: number, maximum: number) {
  const pageStep = Math.max(1, Math.round((maximum - minimum) / 10));

  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(minimum, current - 1);
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(maximum, current + 1);
    case 'PageDown':
      return Math.max(minimum, current - pageStep);
    case 'PageUp':
      return Math.min(maximum, current + pageStep);
    case 'Home':
      return minimum;
    case 'End':
      return maximum;
    default:
      return undefined;
  }
}
