import { getAllCountriesStats, getCountryStats } from '@/data';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ code: string }>;
};

export const dynamic = 'force-static';

export async function GET(_: Request, props: PageProps) {
  const { code: codeParam } = await props.params;
  const check = codeParam.match(/^([a-z]{2})\.json$/i);
  const code = check?.[1]?.toUpperCase();

  if (!code) {
    return notFound();
  }

  const stats = await getCountryStats(code);

  if (!stats) {
    return notFound();
  }

  return Response.json(stats);
}

export async function generateStaticParams() {
  const countries = await getAllCountriesStats();

  return Object.keys(countries).map((code) => ({ code: `${code.toLowerCase()}.json` }));
}
