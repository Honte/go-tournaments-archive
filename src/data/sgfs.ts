import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Tournament } from '@/schema/data';
import EVENT from '@event';
import EVENT_CONFIG from '@event/config';

const SGF_DIR = `./events/${EVENT}/sgf`;

export async function loadSgfs(tournament: Tournament): Promise<Record<string, string>> {
  if (!tournament.games) {
    return {};
  }

  const sgfPrefix = process.env.SGF_URL_PREFIX ?? EVENT_CONFIG.sgfUrlPrefix;
  const result: Record<string, string> = {};
  for (const id in tournament.games) {
    const game = tournament.games[id];

    if (game.props?.sgf) {
      const relativePath = game.props.sgf.replace(sgfPrefix, '');
      result[id] = await readFile(join(SGF_DIR, relativePath), 'utf-8');
    }
  }

  return result;
}
