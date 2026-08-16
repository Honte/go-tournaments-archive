import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lookupPlayerId, registerLookupEntry, type PlayerLookupMap } from './lookup';
import { normalizePlayerName } from './utils';

describe('player lookup', () => {
  it('adds a comma-form candidate for multi-part player names', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Test Alpha', 'ta');

    assert.equal(lookup.get(normalizePlayerName('Alpha, Test')), 'ta');
  });

  it('uses a unique matching name part when another part is misspelled', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Test Alpha', 'ta');
    registerLookupEntry(lookup, 'Alpha', 'ta', false);

    assert.equal(lookupPlayerId(lookup, 'Tset, Alpha'), 'ta');
  });

  it('uses an unambiguous surname but not a shared given name', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Shared Alpha', 'sa');
    registerLookupEntry(lookup, 'Shared Beta', 'sb');
    registerLookupEntry(lookup, 'Shared', 'sa', false);
    registerLookupEntry(lookup, 'Shared', 'sb', false);
    registerLookupEntry(lookup, 'Alpha', 'sa', false);
    registerLookupEntry(lookup, 'Beta', 'sb', false);

    assert.equal(lookupPlayerId(lookup, 'Sharedd, Alpha'), 'sa');
    assert.equal(lookupPlayerId(lookup, 'Shared, Alphaa'), null);
  });

  it('does not resolve a one-letter initial to an unrelated player', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Q Test', 'qt');
    registerLookupEntry(lookup, 'Q', 'qt', false);
    registerLookupEntry(lookup, 'Quinn Sample', 'qs');
    registerLookupEntry(lookup, 'T Sample', 'ts');
    registerLookupEntry(lookup, 'Sample', 'qs', false);
    registerLookupEntry(lookup, 'Sample', 'ts', false);

    assert.equal(lookup.get(normalizePlayerName('Q')), undefined);
    assert.equal(lookupPlayerId(lookup, 'Q Sample'), null);
  });
});
