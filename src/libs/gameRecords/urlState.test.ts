import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_GAME_RECORDS_STATE, parseGameRecordsState, serializeGameRecordsState } from '@/libs/gameRecords';

describe('game browser URL state', () => {
  it('round-trips year-round grouping', () => {
    const parsed = parseGameRecordsState(new URLSearchParams('group=year-round'));
    assert.equal(parsed.group, 'year-round');
    assert.equal(serializeGameRecordsState(parsed).get('group'), 'year-round');
  });

  it('round-trips canonical state and preserves unrelated query parameters', () => {
    const parsed = parseGameRecordsState(
      new URLSearchParams(
        'player=a&country=de&opponent=b&opponentCountry=pl&playerRankMin=5K&year=2023&year=2020&movesMax=200' +
          '&category=u18&result=time&result=resignation&winner=player-opponent&has=yt&has=ogs&sort=moves-desc&group=year'
      )
    );
    const serialized = serializeGameRecordsState(
      parsed,
      new URLSearchParams('locale=pl&source=archive&player=stale&result=other')
    );

    assert.equal(serialized.get('locale'), 'pl');
    assert.equal(serialized.get('source'), 'archive');
    assert.equal(serialized.get('player'), 'a');
    assert.deepEqual(serialized.getAll('year'), ['2023', '2020']);
    assert.deepEqual(serialized.getAll('result'), ['resignation', 'time']);
    assert.deepEqual(serialized.getAll('has'), ['ogs', 'yt']);
    assert.equal(serialized.get('winner'), 'player-opponent');
    assert.equal(serialized.get('category'), 'u18');
    assert.equal(serialized.get('group'), 'year');
    assert.deepEqual(parseGameRecordsState(serialized), parsed);
  });

  it('parses global-color, jigo, player-relative, and country-relative winner values', () => {
    for (const winner of [
      'black',
      'white',
      'jigo',
      'player',
      'player-opponent',
      'country',
      'country-opponent',
    ] as const) {
      assert.equal(parseGameRecordsState(new URLSearchParams(`winner=${winner}`)).winner, winner);
    }
  });

  it('falls back to defaults for unknown enum values', () => {
    const parsed = parseGameRecordsState(
      new URLSearchParams('result=unsupported&has=video&winner=winner&sort=random&group=player')
    );

    assert.deepEqual(parsed.results, []);
    assert.deepEqual(parsed.media, []);
    assert.equal(parsed.sort, DEFAULT_GAME_RECORDS_STATE.sort);
    assert.equal(parsed.group, DEFAULT_GAME_RECORDS_STATE.group);
    assert.equal(parsed.winner, undefined);
  });

  it('round-trips group-count sort values', () => {
    for (const sort of ['group-count-desc', 'group-count-asc'] as const) {
      const parsed = parseGameRecordsState(new URLSearchParams(`sort=${sort}&group=year`));
      const serialized = serializeGameRecordsState(parsed);

      assert.equal(parsed.sort, sort);
      assert.equal(serialized.get('sort'), sort);
      assert.equal(serialized.get('group'), 'year');
      assert.deepEqual(parseGameRecordsState(serialized), parsed);
    }
  });

  it('round-trips Unknown komi and canonicalizes the old null value', () => {
    const parsed = parseGameRecordsState(new URLSearchParams('komi=unknown&komi=null'));
    const serialized = serializeGameRecordsState(parsed);

    assert.deepEqual(parsed.komi, ['unknown']);
    assert.deepEqual(serialized.getAll('komi'), ['unknown']);
  });

  it('ignores and removes legacy tournament-year ranges', () => {
    const legacy = new URLSearchParams('yearMin=2020&yearMax=2022');
    const parsed = parseGameRecordsState(legacy);
    const serialized = serializeGameRecordsState(parsed, legacy);

    assert.deepEqual(parsed.years, []);
    assert.equal('yearMin' in parsed, false);
    assert.equal('yearMax' in parsed, false);
    assert.equal(serialized.has('yearMin'), false);
    assert.equal(serialized.has('yearMax'), false);
  });
});
