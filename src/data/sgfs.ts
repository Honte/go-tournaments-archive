import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Tournament } from '@/schema/data';

export async function loadSgfs(tournament: Tournament): Promise<Record<string, string>> {
  if (!tournament.games) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const id in tournament.games) {
    const game = tournament.games[id];

    if (game.props?.sgf) {
      result[id] = await readFile(
        join('./public', game.props.sgf.replace(process.env.SGF_URL_PREFIX ?? '', '/sgf/')),
        'utf-8'
      );
    }
  }

  return result;
}
