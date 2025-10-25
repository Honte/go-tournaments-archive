import Link from 'next/link';

export function YearLink({ year, locale }) {
  return (
    <Link href={`/${locale}/${year}`} className="underline text-pgc-primary hover:text-pgc-hover">
      {year}
    </Link>
  );
}
