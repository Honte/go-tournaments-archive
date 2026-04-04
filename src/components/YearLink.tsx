import Link from 'next/link';

type YearLinkProps = {
  year: string | number;
  locale: string;
};

export function YearLink({ year, locale }: YearLinkProps) {
  return (
    <Link href={`/${locale}/${year}`} className="underline text-pgc-primary hover:text-pgc-hover">
      {year}
    </Link>
  );
}
