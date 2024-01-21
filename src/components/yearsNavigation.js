'use client'

import Link from 'next/link';
import { forwardRef, useImperativeHandle, useState } from 'react';

export const YearsNavigation = forwardRef(function YearsNavigation({ locale, years, current }, ref) {
  const min = years[0];
  const max = years[years.length - 1]
  const [selected, setSelected] = useState(between(min, current, max))

  const index = years.indexOf(selected);
  const prev = years.slice(0, index);
  const next = years.slice(index + 1);

  useImperativeHandle(ref, () => ({
    move(direction) {
      setSelected(between(min, selected + Math.sign(direction), max))
    },
    select(year) {
      setSelected(between(min, year, max))
    },
    current() {
      return selected
    }
  }), [min, max, selected, setSelected])

  return (
    <div className="mx-auto relative px-2 flex items-center">
      <div className="absolute right-full flex gap-2 text-2xl">
        {prev.map((year) => <Link key={year} href={`/${locale}/${year}`} className="text-pgc-primary hover:text-pgc-hover font-bold underline">{year}</Link>)}
      </div>
      <h1 className="text-4xl font-bold">{selected}</h1>
      <div className="absolute left-full flex gap-2 text-2xl">
        {next.map((year) => <Link key={year} href={`/${locale}/${year}`} className="text-pgc-primary hover:text-pgc-hover font-bold underline">{year}</Link>)}
      </div>
    </div>
  )
})

function between(min, value, max) {
  return Math.min(max, Math.max(min, value));
}
