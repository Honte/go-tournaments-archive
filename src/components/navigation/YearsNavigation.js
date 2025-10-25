'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { forwardRef, useImperativeHandle, useState } from 'react';

export const YearsNavigation = forwardRef(function YearsNavigation({ locale, years, current }, ref) {
  const min = years[0];
  const max = years[years.length - 1];
  const [selected, setSelected] = useState(between(min, current, max));

  useImperativeHandle(
    ref,
    () => ({
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
    [min, max, selected, setSelected]
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
                className={clsx('text-pgc-primary hover:text-pgc-hover font-bold underline', {
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
                className={clsx('text-pgc-primary hover:text-pgc-hover font-bold underline', {
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
});

function between(min, value, max) {
  return Math.min(max, Math.max(min, value));
}
