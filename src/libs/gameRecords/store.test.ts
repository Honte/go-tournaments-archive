import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createGameRecordsStore } from '@/libs/gameRecords';
import { canNavigateBackTo, updateNavigationUrl } from '@/libs/navigation';
import { buildGameRecordsModel } from './model';
import { createGames, state } from './testFixtures';

describe('game records store', () => {
  const games = createGames();

  it('recomputes the model through facet setters and clears all filters', () => {
    const store = createGameRecordsStore({
      games,
      options: {},
      initialState: state(),
    });

    store.getState().setFilters({ player: 'a' });

    assert.equal(store.getState().model.state.player, 'a');
    assert.equal(store.getState().model.filteredCount, 3);

    store.getState().setFilters({ opponent: 'b', years: [2020] });

    assert.equal(store.getState().model.filteredCount, 1);
    assert.deepEqual(
      store.getState().model.games.map((game) => game.sgf),
      ['g1.sgf']
    );

    store.getState().clearFilters();

    assert.deepEqual(store.getState().model.state, buildGameRecordsModel(games, state()).state);
    assert.equal(store.getState().model.filteredCount, games.length);
  });

  it('keeps independently created stores isolated', () => {
    const first = createGameRecordsStore({ games, options: {}, initialState: state() });
    const second = createGameRecordsStore({ games, options: {}, initialState: state() });

    first.getState().setFilters({ player: 'a' });

    assert.equal(first.getState().model.state.player, 'a');
    assert.equal(second.getState().model.state.player, undefined);
  });

  it('stores expansion state independently from filter state', () => {
    const store = createGameRecordsStore({ games, options: {}, initialState: state() });

    assert.equal(store.getState().expanded, false);

    store.getState().setExpanded(true);
    store.getState().setFilters({ player: 'a' });

    assert.equal(store.getState().expanded, true);
    assert.equal(store.getState().model.state.player, 'a');
  });

  it('pushes filter changes and applies browser navigation without losing unrelated parameters', async () => {
    const previousWindow = globalThis.window;
    const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
    const listeners = new Map<string, EventListener>();
    let search = '?source=archive';
    let historyUrl = '';
    let historyState: unknown = null;

    const fakeWindow = {
      location: { pathname: '/pl/stats/games', hash: '#records' },
      get scrollY() {
        return 0;
      },
      scrollTo: () => undefined,
      history: {
        get state() {
          return historyState;
        },
        pushState: (state: unknown, _title: string, url: string) => {
          historyState = state;
          historyUrl = url;
          search = new URL(url, 'https://archive.test').search;
        },
        replaceState: (state: unknown, _title: string, url: string) => {
          historyState = state;
          historyUrl = url;
          search = new URL(url, 'https://archive.test').search;
        },
      },
      addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
      removeEventListener: (type: string) => listeners.delete(type),
    } as unknown as Window;

    Object.defineProperty(fakeWindow.location, 'search', {
      configurable: true,
      get: () => search,
    });
    Object.defineProperty(fakeWindow.location, 'href', {
      configurable: true,
      get: () => `https://archive.test/pl/stats/games${search}#records`,
    });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: fakeWindow });
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => callback(0),
    });

    try {
      const store = createGameRecordsStore({ games, options: {}, initialState: state() });
      await store.persist.rehydrate();
      const unbind = store.listen();

      store.getState().setFilters({ player: 'a' });

      assert.equal(new URLSearchParams(search).get('source'), 'archive');
      assert.equal(new URLSearchParams(search).get('player'), 'a');
      assert.equal(canNavigateBackTo(new URLSearchParams('source=archive')), true);

      search = '?source=archive&player=b';
      listeners.get('popstate')?.(new Event('popstate'));
      await Promise.resolve();

      assert.equal(store.getState().model.state.player, 'b');

      updateNavigationUrl(new URLSearchParams('source=archive&player=c'), 'replace');
      await Promise.resolve();

      assert.equal(store.getState().model.state.player, 'c');
      assert.equal(new URL(historyUrl, 'https://archive.test').pathname, '/pl/stats/games');
      assert.equal(new URL(historyUrl, 'https://archive.test').hash, '#records');
      unbind();
    } finally {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
      Object.defineProperty(globalThis, 'requestAnimationFrame', {
        configurable: true,
        value: previousRequestAnimationFrame,
      });
    }
  });
});
