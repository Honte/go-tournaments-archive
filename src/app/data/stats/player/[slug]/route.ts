import { getAllPlayersStats, getPlayerStats } from '@/data';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-static';

export async function GET(_: Request, props: PageProps) {
  const { slug: slugParam } = await props.params;
  const check = slugParam.match(/^(.+)\.json$/);
  const slug = check?.[1];

  if (!slug) {
    return notFound();
  }

  const stats = await getPlayerStats(slug);

  if (!stats) {
    return notFound();
  }

  return Response.json(stats);
}

export async function generateStaticParams() {
  const players = await getAllPlayersStats();

  return Object.keys(players)
    .filter((slug) => slug !== 'BYE')
    .map((slug) => ({ slug: `${slug}.json` }));
}
