import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import { getCategoryStats } from '@/data/serverApi';

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function GET(_: Request, props: PageProps) {
  const { category: categoryParam } = await props.params;
  const check = categoryParam.match(/^(.+)\.json$/);
  const category = check?.[1];

  if (!category) {
    return notFound();
  }

  const event = await loadDefaultEvent();
  const categoryStats = await getCategoryStats(event, category);

  if (!categoryStats) {
    return notFound();
  }

  return Response.json(categoryStats);
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

  return (event.categories || ['none']).map((category) => ({
    category: `${category}.json`,
  }));
}
