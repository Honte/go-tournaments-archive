import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ReactElement, ReactNode } from 'react';
import { createCardElement } from './render';
import type {
  ArchiveCardSpec,
  EditionCardSpec,
  GamesCardSpec,
  GeneralCardSpec,
  SocialLogoAsset,
  StatsCardSpec,
} from './schema';

const LOGO: SocialLogoAsset = {
  src: 'data:image/svg+xml;base64,PHN2Zy8+',
  width: 64,
  height: 64,
};

const BG = 'data:image/jpeg;base64,/9j/';

function isReactElement(
  node: ReactNode
): node is ReactElement<{ children?: ReactNode; style?: Record<string, unknown> }> {
  return typeof node === 'object' && node !== null && 'type' in node && 'props' in node;
}

function collectElements(
  node: ReactNode,
  out: ReactElement<{ children?: ReactNode; style?: Record<string, unknown> }>[] = []
) {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectElements(child, out);
    }

    return out;
  }

  if (isReactElement(node)) {
    out.push(node);
    collectElements(node.props.children, out);
  }

  return out;
}

function collectText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(collectText).join('');
  }

  if (isReactElement(node)) {
    return collectText(node.props.children);
  }

  return '';
}

describe('social card element renderer', () => {
  it('renders archive cards without a top bar and with unique tag keys even when acronyms repeat', () => {
    const spec: ArchiveCardSpec = {
      type: 'archive',
      title: 'European Go Championships Archives',
      subtitle: 'Browse 2 Go tournaments.',
      eventAcronyms: ['EGC', 'EGC'],
      extraEventsCount: 1,
    };

    const element = createCardElement(spec, BG, LOGO);
    const elements = collectElements(element);
    const keyedTags = elements.filter((item) => item.type === 'div' && item.key !== null);

    assert.deepEqual(
      keyedTags.map((item) => item.key),
      ['0-EGC', '1-EGC', '2-+1']
    );
    assert.equal(
      elements.some((item) => item.props.style?.height === 6 && item.props.style?.top === 0),
      false
    );
    assert.match(collectText(element), /European Go Championships Archives/);
  });

  it('renders edition cards with preserved podium rank numbers and medal colors on tied places', () => {
    const spec: EditionCardSpec = {
      type: 'edition',
      siteName: 'Polish Go Championships Archive',
      heading: 'PGC 2025',
      metaLine: 'Gdańsk, Nov 8–11, 2025',
      statsLine: '4 players, 2 SGF game records',
      podium: [
        { rank: 1, names: 'Alice, Bob' },
        { rank: 3, names: 'Carol' },
      ],
      categoryWinners: [],
      isPairs: false,
    };

    const element = createCardElement(spec, BG, LOGO);
    const elements = collectElements(element);
    const podiumRows = elements.filter((item) => item.key === '1-Alice, Bob' || item.key === '3-Carol');
    assert.equal(podiumRows.length, 2);

    const bronzeDot = elements.find((item) => item.props.children === '3');
    assert.ok(bronzeDot);
    assert.equal(bronzeDot.props.style?.backgroundColor, '#cd7f32');
    assert.equal(
      elements.some((item) => item.props.children === '2'),
      false
    );
    assert.match(collectText(element), /Polish Go Championships Archive/);
  });

  it('renders archive name next to logo only when it is not repeated in the middle', () => {
    const repeatedStats: StatsCardSpec = {
      type: 'stats',
      siteName: 'European Go Championships Archive',
      title: 'European Go Championships Archive',
      subtitle: 'Tournament results, game records, participation summaries and player statistics.',
      metrics: [{ value: '2', label: 'editions' }],
    };
    const distinctStats: StatsCardSpec = {
      type: 'stats',
      siteName: 'Polish Go Championships Archive',
      title: 'Polish Go Championship',
      subtitle: 'Tournament results, game records, participation summaries and player statistics.',
      metrics: [{ value: '2', label: 'editions' }],
    };

    const repeatedText = collectText(createCardElement(repeatedStats, BG, LOGO));
    assert.equal(repeatedText.match(/European Go Championships Archive/g)?.length, 1);

    const distinctText = collectText(createCardElement(distinctStats, BG, LOGO));
    assert.match(distinctText, /Polish Go Championships Archive/);
    assert.match(distinctText, /Polish Go Championship/);
  });

  it('renders general, stats, games, categorized, and upcoming edition variants cleanly', () => {
    const general: GeneralCardSpec = {
      type: 'general',
      siteName: 'Polish Go Championships Archive',
      subtitle: 'Results, standings, all-time statistics, and SGF game records.',
      pills: ['2024–2025', '2 editions'],
    };
    const stats: StatsCardSpec = {
      type: 'stats',
      siteName: 'Polish Go Championships Archive',
      title: 'Polish Go Championship',
      subtitle: 'Tournament results, game records, participation summaries and player statistics.',
      metrics: [{ value: '2', label: 'editions' }],
    };
    const games: GamesCardSpec = {
      type: 'games',
      title: 'European Go Championships Archive',
      subtitle: 'Browse and replay SGF game records.',
      pills: ['42 SGF games'],
    };
    const categorized: EditionCardSpec = {
      type: 'edition',
      siteName: 'EYGC Archive',
      heading: 'EYGC 2025',
      podium: [],
      categoryWinners: [{ category: 'U18', label: 'Under 18', winner: 'Alice' }],
      isPairs: false,
    };
    const upcoming: EditionCardSpec = {
      type: 'edition',
      siteName: 'WAGC Archive',
      heading: 'WAGC 2026',
      podium: [],
      categoryWinners: [],
      isPairs: false,
      upcomingBadge: 'UPCOMING EDITION',
    };

    assert.match(collectText(createCardElement(general, BG, LOGO)), /2024–2025/);
    assert.match(collectText(createCardElement(stats, BG, LOGO)), /Polish Go Championships Archive/);
    assert.match(collectText(createCardElement(games, BG, LOGO)), /42 SGF games/);
    assert.match(collectText(createCardElement(categorized, BG, LOGO)), /U18Alice/);
    assert.match(collectText(createCardElement(upcoming, BG, LOGO)), /UPCOMING EDITION/);
  });
});
