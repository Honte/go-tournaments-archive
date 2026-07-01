import type { EventContext } from '@/schema/event';
import type { EventPlayer } from '@/data/eventPlayers';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { loadData } from '@/data/load';
import { mergeEventPlayers } from './file';

export async function collectEventPlayers(
  event: EventContext,
  existingPlayers?: EventPlayer[]
): Promise<EventPlayer[]> {
  const [existing, data] = await Promise.all([existingPlayers ?? readEventPlayersFile(event.id), loadData(event)]);
  const discovered = Object.values(data.stats.players)
    .filter((player) => player.id !== 'BYE')
    .map<EventPlayer>((player) => ({
      id: player.id,
      name: player.name,
      country: player.country.length === 1 ? player.country[0] : undefined,
      egd: player.egd,
      original: player.original,
      nickname: player.nickname ?? [],
    }));

  return mergeEventPlayers(existing, discovered);
}

export function requireEventId(event: unknown): string {
  if (typeof event !== 'string' || !event.trim()) {
    console.error('Event is missing');
    process.exit(1);
  }

  return event;
}
