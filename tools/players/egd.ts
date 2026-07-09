import { loadEventDefinition } from '@/events';
import { readCliParams } from '@tools/cli';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { collectEventPlayers, requireEventId } from './common';
import { enrichPlayersWithEgd, ensureEgdArchive, readEgdPlayersFromZip } from './egdData';
import { updateEventPlayersFile } from './file';

const { event, force } = readCliParams({
  event: { type: 'string', positional: true, short: 'e', default: process.env.EVENT },
  force: { type: 'boolean', short: 'f', default: false },
});

const targetEvent = await loadEventDefinition(requireEventId(event));
const archivePath = await ensureEgdArchive(Boolean(force));
const egdPlayers = await readEgdPlayersFromZip(archivePath);
const existingPlayers = await readEventPlayersFile(targetEvent.id);
const players = await collectEventPlayers(targetEvent, existingPlayers);
const result = enrichPlayersWithEgd(players, egdPlayers, {
  includeCountry: Boolean(targetEvent.showCountry),
  savedPlayers: existingPlayers,
});
const updateResult = await updateEventPlayersFile(targetEvent.id, players, {
  includeCountry: Boolean(targetEvent.showCountry),
  updateExisting: true,
});

console.log(`Newly matched: ${result.newlyMatched}`);
console.log(`Already matched: ${result.alreadyMatched}`);
console.log(`Updated: ${updateResult.updated}`);
console.log(`Added rows: ${updateResult.added}`);
console.log(`Unmatched: ${result.unmatched.length}`);
console.log(`Ambiguous: ${result.ambiguous.length}`);
console.log(`Conflicts: ${result.conflicts.length}`);
console.log(`Country warnings: ${result.countryMismatches.length}`);

if (result.ambiguous.length) {
  console.log('Ambiguous players:');
  for (const player of result.ambiguous) {
    console.log(`- ${player}`);
  }
}

if (result.conflicts.length) {
  console.log('Conflicts:');
  for (const player of result.conflicts) {
    console.log(`- ${player}`);
  }
}

if (result.countryMismatches.length) {
  console.log('Country warnings:');
  for (const player of result.countryMismatches) {
    console.log(`- ${player}`);
  }
}
