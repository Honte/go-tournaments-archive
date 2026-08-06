import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createNavigationUrl, getNavigationCorrection, getNavigationLocation } from './navigation';

describe('navigation target reconciliation', () => {
  it('records the exact same-origin URL and rejects external targets', () => {
    const target = createNavigationUrl('/pl/stats/games?year=2008#records', 'https://archive.test/pl/2008');

    assert.equal(target?.pathname, '/pl/stats/games');
    assert.equal(target?.searchParams.get('year'), '2008');
    assert.equal(target?.hash, '#records');
    assert.equal(createNavigationUrl('https://example.com/', 'https://archive.test/pl/2008'), null);
  });

  it('corrects stale cached search parameters to the link target', () => {
    const target = createNavigationUrl('/pl/stats/games', 'https://archive.test/pl/2008')!;

    assert.equal(getNavigationCorrection('https://archive.test/pl/stats/games?year=2008', target), '/pl/stats/games');
  });

  it('waits for the intended pathname and leaves an exact URL alone', () => {
    const target = createNavigationUrl('/pl/stats/games?year=2008', 'https://archive.test/pl/2008')!;

    assert.equal(getNavigationCorrection('https://archive.test/pl/2008', target), undefined);
    assert.equal(getNavigationCorrection('https://archive.test/pl/stats/games?year=2008', target), undefined);
  });

  it('uses the intended query while a cached destination is being restored', () => {
    const current = createNavigationUrl('/pl/2008?sgf=old.sgf', 'https://archive.test/pl')!;
    const queryless = createNavigationUrl('/pl/2008', 'https://archive.test/pl/stats/games?sgf=old.sgf')!;
    const explicit = createNavigationUrl('/pl/2008?sgf=2008%2Fgame.sgf', 'https://archive.test/pl')!;

    assert.equal(getNavigationLocation({ location: current, target: queryless }, '/pl/2008')?.searchParams.size, 0);
    assert.equal(
      getNavigationLocation({ location: current, target: explicit }, '/pl/2008')?.searchParams.get('sgf'),
      '2008/game.sgf'
    );
    assert.equal(getNavigationLocation({ location: current, target: queryless }, '/pl/2007'), null);
  });
});
