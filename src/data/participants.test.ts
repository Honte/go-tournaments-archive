import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { Game, Participant, TournamentDetails } from '@/schema/data';
import type { EventDefinition } from '@/schema/event';
import en from '@/i18n/en.json';
import { Sgf } from '@tools/sgf';
import { getOpponentRows, getPartnerRows } from '@/libs/pairStats';
import { isPair } from '@/libs/participants';
import { loadSgf } from '@/libs/sgf';
import { loadClassificationStage } from '@/data/classification';
import { parseH9Tournament } from '@/data/h9tournament';
import { loadParticipants } from '@/data/participants';
import { createPlayersHandler } from '@/data/players';
import { getSgfProps } from '@/data/sgfs';
import { parseStage } from '@/data/stages';
import { calculateStats } from '@/data/stats';

const translations = { ...en, locale: 'en' as const, site: { ...en.site, acronym: 'Test' } };
const event: EventDefinition = { id: 'test', locales: ['en'], pairs: true };

it('loads YAML pairs with independent identities and classification medals', () => {
  const handler = createPlayersHandler();
  const participants = loadParticipants({ team: 'Alice One 2d (GB) |1 + Bob Two 4d |2; 3d (JP)' }, event, handler);
  const pair = participants.team;
  const reversed = loadParticipants({ team: 'Bob Two 4d |2 + Alice One 2d (GB) |1; 3d (JP)' }, event, handler).team;
  assert.equal(reversed.id, pair.id);
  const unknown = loadParticipants(
    { team: 'Alice One 30k + Bob Two; 30k (JP)' },
    { ...event, unknownRanks: ['30k'] },
    handler
  ).team;
  assert.ok(isPair(unknown));
  assert.equal(unknown.rank, undefined);
  assert.equal(unknown.members[0].rank, undefined);
  assert.equal(unknown.members[1].rank, undefined);
  assert.ok(isPair(pair));
  assert.deepEqual(
    pair.members.map((p) => [p.rank, p.country, p.egd]),
    [
      ['2d', 'GB', 1],
      ['4d', 'JP', 2],
    ]
  );
  const details: TournamentDetails = { year: 2025, top: [] };
  const stage = loadClassificationStage({
    event,
    stage: { type: 'classification', date: '2025', order: ['team'] },
    playersMap: participants,
    playersHandler: handler,
    tournamentDetails: details,
  });
  const stats = calculateStats(
    event,
    [{ ...details, id: 2025, participants, games: {}, stages: [stage], hasSgfs: false }],
    handler
  );
  assert.equal(Object.keys(stats.players).length, 2);
  assert.equal(stats.countries.JP.medals[0].length, 1);
  assert.equal(stats.countries.GB, undefined);
  for (const player of Object.values(stats.players)) {
    assert.deepEqual(player.medals[0], ['2025']);
    assert.equal(player.totalAttended, 1);
    assert.equal(player.results[0].pairRank, '3d');
    assert.ok(player.results[0].partner);
  }
  assert.throws(
    () => loadParticipants({ team: 'Alice One + Alice One; 3d (JP)' }, event, handler),
    /different players/
  );
  assert.throws(
    () =>
      loadParticipants({ a: 'Alice One + Bob Two; 3d (JP)', b: 'Alice One + Carol Three; 3d (JP)' }, event, handler),
    /multiple pairs/
  );
});

it('counts pair games once globally and once per member, including draws, BYE and pending games', () => {
  const handler = createPlayersHandler();
  const participants: Record<string, Participant> = {};
  const games: Record<string, Game> = {};
  const details: TournamentDetails = { year: 2025, top: [] };
  const stage = parseH9Tournament(
    {
      event,
      stage: { type: 'tournament', file: 'inline', date: '2025', customBreakers: {} },
      stageIndex: 0,
      playersMap: participants,
      playersHandler: handler,
      gamesMap: games,
      tournamentDetails: details,
    },
    '1 One Alice Two Bob 3d JP xxx 2+/b 2=/w 2?/b 0+\n2 Three Carol Four Dan 2d JP xxx 1-/w 1=/b 1?/w 0='
  );
  const stats = calculateStats(
    event,
    [{ ...details, id: 2025, participants, games, stages: [stage], hasSgfs: false }],
    handler
  );
  assert.equal(stats.summary.playedGames, 2);
  assert.equal(stats.summary.unresolved, 1);
  assert.equal(stats.summary.players, 4);
  assert.equal(stats.countries.JP.totalGames, 5);
  const alice = Object.values(stats.players).find((p) => p.name === 'Alice One')!;
  assert.equal(alice.totalGames, 3);
  assert.equal(alice.totalWon, 2);
  assert.equal(alice.totalDrawn, 1);
  assert.equal(alice.totalUnresolved, 1);
  assert.deepEqual(
    getOpponentRows(alice).map((p) => p.games),
    [2, 2]
  );
  assert.deepEqual(
    getOpponentRows(alice, true).map((p) => p.games),
    [2]
  );
  assert.equal(getPartnerRows(alice)[0].games, 3);
  assert.equal(getPartnerRows(alice)[0].gold, 1);
});

it('rejects unsupported pair stages', async () => {
  await assert.rejects(
    parseStage({
      event,
      stage: { type: 'league', date: '2025', rounds: [] },
      stageIndex: 0,
      playersMap: {},
      playersHandler: createPlayersHandler(),
      gamesMap: {},
      tournamentDetails: { year: 2025, top: [] },
    }),
    /Pairs do not support/
  );
});

it('roundtrips both SGF members in presentation order and exports pair metadata', () => {
  const handler = createPlayersHandler();
  const participants: Record<string, Participant> = {};
  const games: Record<string, Game> = {};
  const details: TournamentDetails = { year: 2025, top: [] };
  const stage = parseH9Tournament(
    {
      event,
      stage: { type: 'tournament', file: 'inline', date: '2025', customBreakers: {} },
      stageIndex: 0,
      playersMap: participants,
      playersHandler: handler,
      gamesMap: games,
      tournamentDetails: details,
    },
    '1 One Alice 2d GB Two Bob 4d JP 3d JP xxx 2+/b\n2 Three Carol 1d DE Four Dan 3d CZ 2d CZ xxx 1-/w'
  );
  const tournament = { ...details, id: 2025, participants, games, stages: [stage], hasSgfs: false };
  const game = Object.values(games)[0];
  const original = '(;GM[1]SZ[19]PB[Original]PW[Original]BR[9p]BT[XX];B[aa])';
  const exported = Sgf.clean(original, getSgfProps({ ...event, showCountry: true }, game, tournament, translations));
  const parsed = loadSgf(exported);
  assert.deepEqual(
    parsed.black.members?.map((m) => m.name),
    ['Alice One', 'Bob Two']
  );
  assert.deepEqual(
    parsed.white.members?.map((m) => m.name),
    ['Carol Three', 'Dan Four']
  );
  const black = participants[game.players[0].id];
  assert.ok(isPair(black));
  assert.deepEqual(
    parsed.black.members?.map((m) => m.id),
    black.members.map((m) => m.id)
  );
  assert.equal(parsed.black.rank, '3d');
  assert.equal(parsed.black.country, 'JP');
  assert.equal(parsed.moves.length, 1);
  assert.equal(
    loadSgf(Sgf.clean(original, getSgfProps(event, game, tournament, translations))).black.country,
    undefined
  );
});

it('keeps shared medals and partner histories independent between editions', () => {
  const handler = createPlayersHandler();
  const tournaments = [2024, 2025].map((year) => {
    const participants = loadParticipants(
      {
        a: year === 2024 ? 'Alice One + Bob Two; 3d (JP)' : 'Alice One + Carol Three; 4d (GB)',
        b: 'Dan Four + Eve Five; 2d (DE)',
      },
      event,
      handler
    );
    const details: TournamentDetails = { year, top: [] };
    const stage = loadClassificationStage({
      event,
      stage: { type: 'classification', date: String(year), order: [['a', 'b']] },
      playersMap: participants,
      playersHandler: handler,
      tournamentDetails: details,
    });
    return { ...details, id: year, participants, games: {}, stages: [stage], hasSgfs: false };
  });
  const stats = calculateStats(event, tournaments, handler);
  const alice = Object.values(stats.players).find((p) => p.name === 'Alice One')!;
  assert.equal(alice.totalAttended, 2);
  assert.deepEqual(alice.medals[0], ['2024', '2025']);
  assert.deepEqual(
    getPartnerRows(alice)
      .map((p) => [p.name, p.attended, p.gold])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    [
      ['Bob Two', 1, 1],
      ['Carol Three', 1, 1],
    ]
  );
  assert.equal(stats.countries.JP.medals[0].length, 1);
  assert.equal(stats.countries.GB.medals[0].length, 1);
  assert.equal(stats.countries.DE.medals[0].length, 2);
});
