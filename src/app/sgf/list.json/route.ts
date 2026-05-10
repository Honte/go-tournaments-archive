import { getTournaments } from '@/data';
import { loadSgfs } from '@/data/sgfs';

export const dynamic = 'force-static';

export async function GET(_: Request) {
  const tournaments = await getTournaments();
  const games = await loadSgfs(tournaments);

  return Response.json(games);
}
