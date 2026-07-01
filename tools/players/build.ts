import { loadEventDefinition } from '@/events';
import { readCliParams } from '@tools/cli';
import { collectEventPlayers, requireEventId } from './common';
import { updateEventPlayersFile } from './file';

const { event } = readCliParams({
  event: { type: 'string', short: 'e', default: process.env.EVENT },
});

const targetEvent = await loadEventDefinition(requireEventId(event));
const players = await collectEventPlayers(targetEvent);
const result = await updateEventPlayersFile(targetEvent.id, players, {
  includeCountry: Boolean(targetEvent.showCountry),
});

console.log(`Added ${result.added} missing players to events/${targetEvent.id}/players.yml`);
