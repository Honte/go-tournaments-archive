import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createNavigationUrl,
  getApplicationNavigationPathname,
  getApplicationNavigationUrl,
  getNavigationCorrection,
  getNavigationLocation,
  getNavigationPathname,
  getServerNavigationState,
  isSameNavigationPathname,
} from './navigation';

describe('navigation target reconciliation', () => {
  it('records the exact same-origin URL and rejects external targets', () => {
    const target = createNavigationUrl('/pl/stats/games?year=2008#records', 'https://archive.test/pl/2008');

    assert.equal(target?.pathname, '/pl/stats/games');
    assert.equal(target?.searchParams.get('year'), '2008');
    assert.equal(target?.hash, '#records');
    assert.equal(createNavigationUrl('https://example.com/', 'https://archive.test/pl/2008'), null);
  });

  it('normalizes Next link paths to the browser base path', () => {
    assert.equal(getNavigationPathname('/en/2006', '/nlkd'), '/nlkd/en/2006');
    assert.equal(getNavigationPathname('/nlkd/en/2006', '/nlkd'), '/nlkd/en/2006');
    assert.equal(getNavigationPathname('/', '/nlkd'), '/nlkd');
    assert.equal(getNavigationPathname('/en/2006'), '/en/2006');
  });

  it('normalizes browser locations to application paths', () => {
    const browserLocation = createNavigationUrl('/nlkd/en/2006?sgf=game.sgf', 'https://archive.test/')!;

    assert.equal(getApplicationNavigationPathname('/nlkd/en/2006', '/nlkd'), '/en/2006');
    assert.equal(getApplicationNavigationPathname('/nlkd', '/nlkd'), '/');
    assert.equal(getApplicationNavigationUrl(browserLocation, '/nlkd')?.pathname, '/en/2006');
    assert.equal(getApplicationNavigationUrl(browserLocation, '/nlkd')?.searchParams.get('sgf'), 'game.sgf');
  });

  it('uses a query-only URL fallback during server rendering', () => {
    assert.equal(getNavigationLocation(getServerNavigationState())?.pathname, '');
  });

  it('matches pathnames regardless of trailing slashes', () => {
    const location = createNavigationUrl('/pl/2008/', 'https://archive.test/')!;

    assert.equal(isSameNavigationPathname('/pl/2008', '/pl/2008/'), true);
    assert.equal(isSameNavigationPathname('/', '/'), true);
    assert.equal(isSameNavigationPathname('/pl/2008', '/pl/2007/'), false);
    assert.equal(getNavigationLocation({ location, target: null }, '/pl/2008'), location);
  });

  it('corrects stale cached search parameters to the link target', () => {
    const target = createNavigationUrl('/pl/stats/games', 'https://archive.test/pl/2008')!;

    assert.equal(getNavigationCorrection('https://archive.test/pl/stats/games?year=2008', target), '/pl/stats/games');
  });

  it('corrects search parameters when the current pathname has a trailing slash', () => {
    const target = createNavigationUrl('/pl/stats/games?year=2008', 'https://archive.test/pl/2008')!;

    assert.equal(
      getNavigationCorrection('https://archive.test/pl/stats/games/?year=2007', target),
      '/pl/stats/games?year=2008'
    );
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
