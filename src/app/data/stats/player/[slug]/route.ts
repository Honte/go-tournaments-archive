import { getAllPlayersStats, getPlayerOpponentsStats, getPlayerStats } from '@/data';
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

  const player = await getPlayerStats(slug);

  if (!player) {
    return notFound();
  }

  const opponents = await getPlayerOpponentsStats(slug);

  return Response.json({
    player,
    opponents,
  });
}

export async function generateStaticParams() {
  const players = await getAllPlayersStats();

  return Object.keys(players)
    .filter((slug) => slug !== 'BYE')
    .map((slug) => ({ slug: `${slug}.json` }));
}
