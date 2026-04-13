'use client';

import clsx from 'clsx';
import Link from 'next/link';

export type YearsNavigationProps = {
  locale: string;
  years: number[];
  current: number;
};

export function YearsNavigation({ locale, years, current }: YearsNavigationProps) {
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
                  hidden: year >= current,
                })}
                draggable={false}
                prefetch={false}
              >
                {year}
              </Link>
            ))}
          </div>
          <h1 className="text-4xl font-bold">{current}</h1>
          <div className="absolute left-full flex gap-2 text-2xl">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${locale}/${year}`}
                className={clsx('text-event-primary hover:text-event-hover font-bold underline', {
                  hidden: year <= current,
                })}
                draggable={false}
                prefetch={false}
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
