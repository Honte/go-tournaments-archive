import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventPlayer } from '@/data/eventPlayers';
import { enrichPlayersWithEgd, parseEgdPlayers } from './egdData';

describe('parseEgdPlayers', () => {
  it('parses EGD fixed-width HTML list rows', () => {
    const players = parseEgdPlayers(`
   PIN          Name                              Club     Grade P&D    GoR    NT appearance
 10000001  Fujiwara no Sai                       JP  xxxx    2p   --   2732   289  T260310A
 10000002  Shindo Hikaru                         JP  Toky    4d   --   2433    85  T210218A
`);

    assert.deepEqual(players, [
      { pin: 10000001, name: 'Fujiwara no Sai', country: 'JP' },
      { pin: 10000002, name: 'Shindo Hikaru', country: 'JP' },
    ]);
  });
});

describe('enrichPlayersWithEgd', () => {
  it('matches EGD rows by reversed player name order', () => {
    const players: EventPlayer[] = [
      {
        id: 'hshindo',
        name: 'Hikaru Shindo',
        nickname: [],
      },
    ];

    const result = enrichPlayersWithEgd(players, [{ pin: 10000002, name: 'Shindo Hikaru', country: 'JP' }], {
      includeCountry: true,
    });

    assert.equal(result.newlyMatched, 1);
    assert.equal(result.alreadyMatched, 0);
    assert.equal(players[0].egd, 10000002);
    assert.equal(players[0].country, 'JP');
  });

  it('counts players with matching existing EGD pins as already matched', () => {
    const players: EventPlayer[] = [
      {
        id: 'hshindo',
        name: 'Hikaru Shindo',
        egd: 10000002,
        nickname: [],
      },
    ];

    const result = enrichPlayersWithEgd(players, [{ pin: 10000002, name: 'Shindo Hikaru', country: 'JP' }], {
      includeCountry: true,
    });

    assert.equal(result.newlyMatched, 0);
    assert.equal(result.alreadyMatched, 1);
    assert.equal(players[0].country, 'JP');
  });

  it('warns when an EGD match has a different country than the saved player row', () => {
    const players: EventPlayer[] = [
      {
        id: 'hshindo',
        name: 'Hikaru Shindo',
        country: 'FR',
        nickname: [],
      },
    ];

    const result = enrichPlayersWithEgd(players, [{ pin: 10000002, name: 'Shindo Hikaru', country: 'JP' }], {
      includeCountry: true,
      savedPlayers: [{ id: 'hshindo', name: 'Hikaru Shindo', country: 'FR', nickname: [] }],
    });

    assert.deepEqual(result.countryMismatches, ['Hikaru Shindo (saved FR, EGD JP)']);
    assert.equal(players[0].country, 'FR');
  });

  it('does not warn when only the tournament-derived country differs from EGD', () => {
    const players: EventPlayer[] = [
      {
        id: 'hshindo',
        name: 'Hikaru Shindo',
        country: 'FR',
        nickname: [],
      },
    ];

    const result = enrichPlayersWithEgd(players, [{ pin: 10000002, name: 'Shindo Hikaru', country: 'JP' }], {
      includeCountry: true,
    });

    assert.deepEqual(result.countryMismatches, []);
    assert.equal(players[0].country, 'FR');
  });
});
