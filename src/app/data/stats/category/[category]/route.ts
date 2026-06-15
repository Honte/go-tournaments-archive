import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import { getCategoryStats } from '@/data';

type PageProps = {
  params: Promise<{ category: string }>;
};

export const dynamic = 'force-static';

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

  if (!event.categories?.length) {
    return [{ category: 'none.json' }];
  }

  return event.categories.map((category) => ({ category: `${category}.json` }));
}
