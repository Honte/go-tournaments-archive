import Link from 'next/link';

export function YearsNavigation({ locale, years, current }) {
  const index = years.indexOf(current);
  const prev = years.slice(0, index);
  const next = years.slice(index + 1);

  return (
    <div className="container flex mx-auto items-center content-center overflow-hidden my-2 faded-left before:w-1/5 faded-right after:w-1/5">
      <div className="mx-auto relative px-2 flex items-center">
        <div className="absolute right-full flex gap-2 text-2xl">
          {prev.map((year) => <Link key={year} href={`/${locale}/${year}`} className="text-pgc-primary hover:text-pgc-hover font-bold underline">{year}</Link>)}
        </div>
        <h1 className="text-4xl font-bold">{current}</h1>
        <div className="absolute left-full flex gap-2 text-2xl">
          {next.map((year) => <Link key={year} href={`/${locale}/${year}`} className="text-pgc-primary hover:text-pgc-hover font-bold underline">{year}</Link>)}
        </div>
      </div>
    </div>
  )
}
