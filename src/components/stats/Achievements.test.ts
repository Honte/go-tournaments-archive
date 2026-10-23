import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import en from '@/i18n/en.json';
import { Achievements } from './Achievements';

const event: EventContext = { id: 'test', prefix: 'test', locales: ['en'], generateSgfs: true };
const player: PlayerStats = {
  id: 'canonical-id',
  name: 'Alice',
  country: [],
  medals: [[], ['2025'], []],
  categoriesMedals: {},
  totalGames: 5,
  totalWon: 3,
  totalDrawn: 1,
  totalUnresolved: 1,
  totalAttended: 1,
  totalSgfs: 2,
  bestPlace: 2,
  score: 100,
  results: [],
  opponents: {},
};

function render(data = player, context = event) {
  return renderToStaticMarkup(
    createElement(Achievements, {
      event: context,
      player: data,
      translations: { ...en, locale: 'en' },
      category: 'u16',
    })
  );
}

it('renders one silver card and a records action with canonical player and category filters', () => {
  const html = render();
  assert.equal((html.match(/<article/g) ?? []).length, 1);
  assert.match(html, /Silver/);
  assert.doesNotMatch(html, />Gold<|>Bronze</);
  assert.match(html, /href="\/test\/en\/stats\/games\?player=canonical-id&amp;category=u16"/);
  assert.match(html, /View game records/);
  assert.match(html, /Games drawn/);
  assert.match(html, /Unresolved/);
});

it('hides the action without records or SGF generation and uses the no-awards fallback', () => {
  assert.doesNotMatch(render({ ...player, totalSgfs: 0 }), /View game records/);
  assert.doesNotMatch(render(player, { ...event, generateSgfs: false }), /View game records/);
  const html = render({ ...player, medals: [[], [], []] }, { ...event, showBestPlace: true });
  assert.match(html, /Best place/);
  assert.doesNotMatch(html, /<article/);
});
