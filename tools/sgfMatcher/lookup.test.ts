import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lookupPlayerId, registerLookupEntry, resolveSgfLookup, type PlayerLookupMap } from './lookup';
import { extractSgfInfo } from './sgf';
import { normalizePlayerName } from './utils';

describe('player lookup', () => {
  it('prefers an exact filename name over a partial SGF metadata name', () => {
    const lookup: PlayerLookupMap<number> = new Map();

    registerLookupEntry(lookup, 'Yi Min-chin', 2);
    registerLookupEntry(lookup, 'Min-chin Yi', 2);
    registerLookupEntry(lookup, 'Lee', 28);
    registerLookupEntry(lookup, 'Song Ronghui', 1);

    const sgf = extractSgfInfo('(;PB[Song Ronghui]PW[Lee Min Jin])', '2008/10-RonghuiSong-MinchinYi.sgf');

    assert.equal(lookupPlayerId(lookup, 'Lee Min Jin'), 28);
    assert.deepEqual(resolveSgfLookup(sgf, lookup), { black: 1, white: 2 });
  });

  it('matches surnames with optional hyphens and underscores in filenames and SGF names', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Test Alpha-Beta', 'ta');
    registerLookupEntry(lookup, 'Sample Gamma_Delta', 'sg');

    const filenameOnly = extractSgfInfo('(;)', '2025/1-TestAlphaBeta-SampleGammaDelta.sgf');
    const metadata = extractSgfInfo('(;PB[Test Alpha_Beta]PW[Sample Gamma-Delta])', 'unknown.sgf');

    assert.deepEqual(resolveSgfLookup(filenameOnly, lookup), { black: 'ta', white: 'sg' });
    assert.deepEqual(resolveSgfLookup(metadata, lookup), { black: 'ta', white: 'sg' });
  });

  it('keeps surnames ambiguous when removing separators makes them identical', () => {
    const lookup: PlayerLookupMap<string> = new Map();

    registerLookupEntry(lookup, 'Alpha-Beta', 'a', false);
    registerLookupEntry(lookup, 'AlphaBeta', 'b', false);

    assert.equal(lookupPlayerId(lookup, 'Alpha_Beta'), null);
  });

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
