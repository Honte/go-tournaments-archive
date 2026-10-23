import assert from 'node:assert/strict';
import { it } from 'node:test';
import { lookupPlayerId, registerLookupEntry } from '@tools/sgfMatcher/lookup';
import { getParticipantName } from '@/libs/participants';
import { loadH9Participant } from '@/data/participants';
import { createPlayersHandler } from '@/data/players';
import { parseH9 } from './h9';

it('imports placeholder given names without shifting columns or IDs', () => {
  const handler = createPlayersHandler();
  for (const name of ['_', 'Jan']) {
    for (const rank of ['1d', '20']) {
      const row = parseH9(`1\tKowalski  ${name} ${rank} PL Klub 10 2+/b |123`).results[0];
      assert.equal(row.name, name === 'Jan' ? 'Jan' : '');
      assert.equal(row.surname, 'Kowalski');
      assert.equal(row.rank, rank === '20' ? '20k' : rank);
      assert.equal(row.country, 'PL');
      assert.equal(row.club, 'Klub');
      assert.equal(row.egd, 123);
      assert.deepEqual(row.scores, ['10']);
      assert.equal(row.games[0]?.opponent, 2);
      const player = loadH9Participant(row, { id: 'test', locales: ['en'] }, handler);
      assert.equal(getParticipantName(player), name === 'Jan' ? 'Jan Kowalski' : 'Kowalski');
      assert.equal(player.id, 'kowalski');
    }
  }
});

it('parses missing given names for either or both pair members', () => {
  for (const first of ['_', 'Alice']) {
    for (const second of ['_', 'Bob']) {
      const row = parseH9(`1 One ${first} 2d Two ${second} 4d 3d PLDE Klub 10 2+/w 0|123|456`).results[0];
      assert.deepEqual(
        row.members?.map((member) => member.name),
        [first === '_' ? '' : first, second === '_' ? '' : second]
      );
      assert.deepEqual(
        row.members?.map((member) => member.egd),
        [123, 456]
      );
      assert.deepEqual(
        row.members?.map((member) => member.country),
        ['PL', 'DE']
      );
      assert.equal(row.rank, '3d');
      assert.equal(row.club, 'Klub');
      assert.deepEqual(row.scores, ['10', '0']);
      assert.equal(row.games[0]?.color, 'white');
      assert.equal(row.line, 1);
    }
  }
});

it('keeps numeric scores aligned after a placeholder given name', () => {
  const individual = parseH9('1 Kowalski _ 1d PL Klub 10 2+').results[0];
  assert.equal(individual.members, undefined);
  assert.deepEqual(individual.scores, ['10']);
});

it('matches surname-only SGF names and refuses ambiguous surnames', () => {
  const lookup = new Map<string, number | null>();
  registerLookupEntry(lookup, 'Kowalski', 1);
  assert.equal(lookupPlayerId(lookup, 'Kowalski'), 1);
  registerLookupEntry(lookup, 'Kowalski', 2, false);
  assert.equal(lookupPlayerId(lookup, 'Kowalski'), null);
});
