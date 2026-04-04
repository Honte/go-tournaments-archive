'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { type RefObject, useImperativeHandle, useState } from 'react';
import { between } from '@/libs/math';

export type YearsNavigationHandle = {
  move: (direction: number) => void;
  select: (year: number) => void;
  current: () => number;
};

export type YearsNavigationProps = {
  locale: string;
  years: number[];
  current: number;
  ref?: RefObject<YearsNavigationHandle | null>;
};

export function YearsNavigation({ locale, years, current, ref }: YearsNavigationProps) {
  const min = years[0];
  const max = years[years.length - 1];
  const [selected, setSelected] = useState(between(min, current, max));

  useImperativeHandle(
    ref,
    (): YearsNavigationHandle => ({
      move(direction) {
        setSelected(between(min, selected + Math.sign(direction), max));
      },
      select(year) {
        setSelected(between(min, year, max));
      },
      current() {
        return selected;
      },
    }),
    [min, max, selected]
  );

  // Whole years needs to be displayed on the sides because if they were removed from DOM while touched, touch events would stop firing
  // Instead, I'm hiding the ones which shouldn't be there
  return (
    <>
      <div className="container flex mx-auto items-center content-center overflow-hidden faded-left before:w-1/5 faded-right after:w-1/5 select-none">
        <div className="mx-auto relative px-2 flex items-center">
          <div className="absolute right-full flex gap-2 text-2xl">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${locale}/${year}`}
                className={clsx('text-event-primary hover:text-event-hover font-bold underline', {
                  hidden: year >= selected,
                })}
                draggable={false}
              >
                {year}
              </Link>
            ))}
          </div>
          <h1 className="text-4xl font-bold">{selected}</h1>
          <div className="absolute left-full flex gap-2 text-2xl">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${locale}/${year}`}
                className={clsx('text-event-primary hover:text-event-hover font-bold underline', {
                  hidden: year <= selected,
                })}
                draggable={false}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
