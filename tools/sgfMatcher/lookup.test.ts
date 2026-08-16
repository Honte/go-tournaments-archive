import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lookupPlayerId, registerLookupEntry, type PlayerLookupMap } from './lookup';
import { normalizePlayerName } from './utils';

describe('player lookup', () => {
  it('adds a comma-form candidate for multi-part player names', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Sebastian Pawlaczyk', 'sp');

    assert.equal(lookup.get(normalizePlayerName('Pawlaczyk, Sebastian')), 'sp');
  });

  it('uses a unique matching name part when another part is misspelled', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Sebastian Pawlaczyk', 'sp');
    registerLookupEntry(lookup, 'Pawlaczyk', 'sp', false);

    assert.equal(lookupPlayerId(lookup, 'Sebestian, Pawlaczyk'), 'sp');
  });

  it('uses an unambiguous surname but not a shared given name', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Adam Siwy', 'as');
    registerLookupEntry(lookup, 'Adam Białożyt', 'ab');
    registerLookupEntry(lookup, 'Adam', 'as', false);
    registerLookupEntry(lookup, 'Adam', 'ab', false);
    registerLookupEntry(lookup, 'Siwy', 'as', false);
    registerLookupEntry(lookup, 'Białożyt', 'ab', false);

    assert.equal(lookupPlayerId(lookup, 'Adamm, Siwy'), 'as');
    assert.equal(lookupPlayerId(lookup, 'Adam, Siwyy'), null);
  });

  it('does not resolve a one-letter initial to an unrelated player', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'W Hofman', 'wh');
    registerLookupEntry(lookup, 'W', 'wh', false);
    registerLookupEntry(lookup, 'Wataru Miyakawa', 'wm');
    registerLookupEntry(lookup, 'T Miyakawa', 'tm');
    registerLookupEntry(lookup, 'Miyakawa', 'wm', false);
    registerLookupEntry(lookup, 'Miyakawa', 'tm', false);

    assert.equal(lookup.get(normalizePlayerName('W')), undefined);
    assert.equal(lookupPlayerId(lookup, 'W Miyakawa'), null);
  });
});
