import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import type { EventDefinition } from '@/schema/event';
import { loadEventDefinition } from '@/events';
import { getPartnerRows } from '@/libs/pairStats';
import { filterPlayerStatsByCategory } from '@/libs/playerStats';
import { loadData, parseTournament } from '@/data/load';
import { createPlayersHandler } from '@/data/players';
import { calculateStats } from '@/data/stats';

it('keeps both 2012 participations of Yu Hua Lu with their own partners and categories', async () => {
  const event = await loadEventDefinition('iapgc');
  const handler = createPlayersHandler();
  const file = 'events/iapgc/data/2012.yml';
  const tournament = await parseTournament(await readFile(file, 'utf8'), file, event, handler);
  const stats = calculateStats(event, [tournament], handler);
  const player = stats.players.ylu;

  assert.ok(player);
  assert.equal(player.totalAttended, 1);
  assert.equal(player.totalGames, 12);
  assert.deepEqual(
    getPartnerRows(player).map((row) => [row.name, row.gold, row.silver, row.bronze]),
    [
      ['Yu-Cheng Lai', 0, 0, 1],
      ['Tang-Yu Tsai', 0, 0, 0],
    ]
  );
  assert.equal(getPartnerRows(filterPlayerStatsByCategory(player, 'iapgc'))[0].bronze, 0);
  assert.equal(getPartnerRows(filterPlayerStatsByCategory(player, 'wmsg'))[0].bronze, 1);
  assert.deepEqual(
    player.results.map((result) => ({
      partner: result.partner?.name,
      stages: result.stages.map((stage) => ({ name: stage.name, place: stage.place, categories: stage.categories })),
    })),
    [
      { partner: 'Tang-Yu Tsai', stages: [{ name: 'IAPGC', place: 8, categories: { iapgc: 8 } }] },
      { partner: 'Yu-Cheng Lai', stages: [{ name: 'WMSG', place: 3, categories: { wmsg: 3 } }] },
    ]
  );
});

it('loads individual and pair events with podium and stage IDs matching the participant dictionary', async () => {
  for (const eventId of ['pgc', 'czpgc']) {
    const event = await loadEventDefinition(eventId);
    const { tournaments, stats } = await loadData(event);

    assert.ok(tournaments.length > 0);
    assert.ok(Object.keys(stats.players).length > 0);
    for (const tournament of tournaments) {
      const podiums = [tournament.top ?? [], ...Object.values(tournament.categoriesTop ?? {})];
      for (const podium of podiums) {
        for (const place of podium) {
          for (const id of place) {
            assert.ok(tournament.participants[id], `${eventId} ${tournament.year}: podium ${id}`);
          }
        }
      }
      for (const stage of tournament.stages) {
        for (const row of stage.table) {
          assert.ok(tournament.participants[row.id], `${eventId} ${tournament.year}: stage ${row.id}`);
        }
      }
    }
  }
});

it('resolves pair aliases and names to canonical podium and stage IDs', async () => {
  const tournament = await parseTournament(
    [
      'players:',
      '  team: Alice One + Bob Two; 3d (JP)',
      'top:',
      '  - [team, Alice_One + Bob_Two]',
      'stages:',
      '  - type: classification',
      '    date: 2025-01-02',
      '    country: JP',
      '    location: Tokyo',
      '    order: [team]',
    ].join('\n'),
    'inline/2025.yml',
    { id: 'test', locales: ['en'], pairs: true },
    createPlayersHandler()
  );

  const [pair] = Object.values(tournament.participants);
  assert.deepEqual(Object.keys(tournament.participants), [pair.id]);
  assert.deepEqual(tournament.top, [[pair.id, pair.id]]);
  assert.equal(tournament.stages[0].table[0].id, pair.id);
  assert.equal(tournament.country, 'JP');
  assert.equal(tournament.location, 'Tokyo');
  assert.equal(tournament.start, '2025-01-02');
});

it('rejects malformed pairs, conflicting membership and unsupported stages', async () => {
  const event: EventDefinition = { id: 'test', locales: ['en'], pairs: true };
  await assert.rejects(
    parseTournament('players:\n  team: Alice One + Bob Two', 'inline/2025.yml', event, createPlayersHandler()),
    /Invalid pair/
  );
  await assert.rejects(
    parseTournament(
      'players:\n  a: Alice One + Bob Two; 3d (JP)\n  b: Alice One + Carol Three; 2d (JP)',
      'inline/2025.yml',
      event,
      createPlayersHandler()
    ),
    /Player Alice One belongs to multiple pairs/
  );
  await assert.rejects(
    parseTournament('stages:\n  - type: league\n    rounds: []', 'inline/2025.yml', event, createPlayersHandler()),
    /inline\/2025.yml:2: Pairs do not support stage type: league/
  );
  await assert.rejects(
    parseTournament('top: [missing]', 'inline/2025.yml', event, createPlayersHandler()),
    /inline\/2025.yml: unknown pair in podium: missing/
  );
});
