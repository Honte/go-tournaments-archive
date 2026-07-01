import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseEventPlayers } from '@/data/eventPlayers';
import { createPlayersHandler } from '@/data/players';

describe('parseEventPlayers', () => {
  it('accepts single and multiple nickname values', () => {
    const players = parseEventPlayers(`
players:
  - id: alpha
    name: Alpha Player
    original: Alpha Original
    nickname:
      - alpha-go
      - aplayer
`);

    assert.deepEqual(players, [
      {
        id: 'alpha',
        name: 'Alpha Player',
        country: undefined,
        egd: undefined,
        original: 'Alpha Original',
        nickname: ['alpha-go', 'aplayer'],
      },
    ]);
  });

  it('rejects multiple original names', () => {
    assert.throws(
      () =>
        parseEventPlayers(`
players:
  - id: alpha
    name: Alpha Player
    original:
      - Alpha A
      - Alpha B
`),
      /players\.yml: players\[0\]\.original must be a string/
    );
  });
});

describe('createPlayersHandler', () => {
  it('uses configured ids and names when loading tournament players by original name', () => {
    const playersHandler = createPlayersHandler([
      {
        id: 'sai',
        name: 'Fujiwara no Sai',
        egd: 123,
        country: 'JP',
        original: '藤原佐為',
        nickname: ['sai'],
      },
    ]);
    const configuredPlayer = playersHandler.getPlayer('sai')!;

    assert.equal(configuredPlayer.displayName, 'Fujiwara no Sai');
    assert.equal(configuredPlayer.lastUsedName, 'Fujiwara no Sai');
    assert.deepEqual([...configuredPlayer.names], ['Fujiwara no Sai', '藤原佐為']);

    const player = playersHandler.loadPlayer('Fujiwara Sai 10p |123');
    const loadedPlayer = playersHandler.getPlayer('sai')!;

    assert.equal(player.id, 'sai');
    assert.equal(player.name, 'Fujiwara Sai');
    assert.equal(player.country, 'JP');
    assert.equal(player.egd, 123);
    assert.equal(player.original, '藤原佐為');
    assert.deepEqual(player.nickname, ['sai']);
    assert.deepEqual([...loadedPlayer.names], ['Fujiwara no Sai', '藤原佐為', 'Fujiwara Sai']);
  });
});
