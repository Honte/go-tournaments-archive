import { ImageResponse } from 'next/og';
import { createElement, type ReactElement } from 'react';
import sharp from 'sharp';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/libs/metadata';
import { loadOgFonts } from './assets';
import type {
  ArchiveCardSpec,
  EditionCardSpec,
  GamesCardSpec,
  GeneralCardSpec,
  OgCardSpec,
  OgLogoAsset,
  OgRenderRequest,
  StatsCardSpec,
} from './schema';

const DARK_BG = '#15181c';
const GOLD_ACCENT = '#c68e1e';
const GOLD_TEXT = '#e5b54b';
const BLUE_ACCENT = '#5287ae';
const BLUE_TEXT = '#93c5fd';
const GREEN_ACCENT = '#799b29';
const GREEN_TEXT = '#bef264';

const MEDAL_COLORS = ['#fece43', '#c0c0c0', '#cd7f32'] as const;
const MEDAL_TEXT_COLORS = ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const;

const el = createElement;

export async function renderOgCardJpeg({ backgroundSrc, card, logo }: OgRenderRequest): Promise<Buffer> {
  const fonts = await loadOgFonts();
  const element = createCardElement(card, backgroundSrc, logo);
  const response = new ImageResponse(element, {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts,
  });
  const pngBuffer = Buffer.from(await response.arrayBuffer());

  return sharp(pngBuffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

export function createCardElement(card: OgCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  switch (card.type) {
    case 'archive':
      return renderArchiveCard(card, backgroundSrc, logo);
    case 'general':
      return renderGeneralCard(card, backgroundSrc, logo);
    case 'edition':
      return renderEditionCard(card, backgroundSrc, logo);
    case 'stats':
      return renderStatsCard(card, backgroundSrc, logo);
    case 'games':
      return renderGamesCard(card, backgroundSrc, logo);
  }
}

function renderArchiveCard(card: ArchiveCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  const titleFontSize = card.title.length > 34 ? 48 : 56;
  const tags = [...card.eventAcronyms];

  if (card.extraEventsCount > 0) {
    tags.push(`+${card.extraEventsCount}`);
  }

  return cardShell(
    backgroundSrc,
    BLUE_ACCENT,
    1,
    [
      [0, 1],
      [42, 1],
      [60, 0.9],
      [78, 0.38],
      [100, 0.14],
    ],
    780,
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      el('img', { src: logo.src, width: logo.width, height: logo.height }),
      card.displayDomain
        ? el(
            'div',
            { style: { fontSize: 20, fontWeight: 600, color: BLUE_TEXT, letterSpacing: '0.05em' } },
            card.displayDomain.toUpperCase()
          )
        : null
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
      el(
        'div',
        { style: { fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' } },
        card.title
      ),
      el('div', { style: { fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 } }, card.subtitle)
    ),
    tags.length > 0
      ? el(
          'div',
          { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
          ...tags.map((tag) =>
            el(
              'div',
              {
                key: tag,
                style: {
                  padding: '9px 18px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(13, 15, 18, 0.84)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  fontSize: 19,
                  fontWeight: 600,
                },
              },
              tag
            )
          )
        )
      : el('div', null)
  );
}

function renderGeneralCard(card: GeneralCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  const titleFontSize = card.siteName.length > 36 ? 44 : 52;
  const headerLabel = card.displayDomain ? card.displayDomain.toUpperCase() : card.acronym;

  return cardShell(
    backgroundSrc,
    GOLD_ACCENT,
    1,
    [
      [0, 1],
      [42, 1],
      [58, 0.92],
      [76, 0.38],
      [100, 0.12],
    ],
    760,
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      logoImage(logo),
      el('div', { style: { fontSize: 20, fontWeight: 600, color: GOLD_TEXT, letterSpacing: '0.06em' } }, headerLabel)
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
      el(
        'div',
        { style: { fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' } },
        card.siteName
      ),
      el('div', { style: { fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 } }, card.subtitle)
    ),
    card.pills.length > 0
      ? el(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
          ...card.pills.map((label) =>
            el(
              'div',
              {
                key: label,
                style: {
                  padding: '10px 18px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(13, 15, 18, 0.82)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  fontSize: 19,
                  fontWeight: 600,
                  color: '#f1f5f9',
                },
              },
              label
            )
          )
        )
      : el('div', null)
  );
}

function renderEditionCard(card: EditionCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  const isUpcoming = Boolean(card.upcomingBadge);
  const accent = isUpcoming ? BLUE_ACCENT : GOLD_ACCENT;
  const domainColor = isUpcoming ? BLUE_TEXT : GOLD_TEXT;
  const headingSize = getEditionHeadingFontSize(card.heading);
  const footerWidth = card.isPairs ? 560 : 480;

  return cardShell(
    backgroundSrc,
    accent,
    1,
    [
      [0, 1],
      [40, 1],
      [58, 0.92],
      [76, 0.38],
      [100, 0.14],
    ],
    780,
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      logoImage(logo),
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        el('div', { style: { fontSize: 22, fontWeight: 600, color: '#e2e8f0' } }, card.siteName),
        card.displayDomain
          ? el(
              'div',
              { style: { fontSize: 17, color: domainColor, fontWeight: 600, marginTop: 2 } },
              card.displayDomain
            )
          : null
      )
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      el(
        'div',
        { style: { fontSize: headingSize, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.02em' } },
        card.heading
      ),
      card.metaLine ? el('div', { style: { fontSize: 26, color: '#e2e8f0' } }, card.metaLine) : null,
      card.statsLine ? el('div', { style: { fontSize: 20, color: '#94a3b8', marginTop: 2 } }, card.statsLine) : null
    ),
    renderEditionFooter(card, footerWidth)
  );
}

function renderEditionFooter(card: EditionCardSpec, width: number): ReactElement {
  if (card.upcomingBadge) {
    return el(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        },
      },
      el(
        'div',
        {
          style: {
            padding: '8px 18px',
            borderRadius: 999,
            backgroundColor: 'rgba(82,135,174,0.22)',
            border: '1px solid rgba(82,135,174,0.55)',
            color: BLUE_TEXT,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.05em',
          },
        },
        card.upcomingBadge
      )
    );
  }

  if (card.podium.length > 0) {
    return el(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        },
      },
      ...card.podium.map((name, index) => {
        const fontSize = card.isPairs ? (index === 0 ? 21 : 19) : index === 0 ? 23 : 21;

        return el(
          'div',
          {
            key: `${index}-${name}`,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize,
              fontWeight: index === 0 ? 600 : 400,
              color: MEDAL_TEXT_COLORS[index] ?? '#cbd5e1',
            },
          },
          medalDot(MEDAL_COLORS[index] ?? '#94a3b8', String(index + 1)),
          name
        );
      })
    );
  }

  if (card.categoryWinners.length > 0) {
    return el(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        },
      },
      ...card.categoryWinners.map((item) =>
        el(
          'div',
          { key: item.category, style: { display: 'flex', alignItems: 'center', gap: 14, fontSize: 21 } },
          el(
            'div',
            {
              style: {
                padding: '2px 10px',
                borderRadius: 6,
                backgroundColor: 'rgba(254, 206, 67, 0.18)',
                border: '1px solid rgba(254, 206, 67, 0.5)',
                color: '#fece43',
                fontSize: 15,
                fontWeight: 700,
                minWidth: 54,
                textAlign: 'center',
              },
            },
            item.category
          ),
          el('div', { style: { fontWeight: 600, color: '#f1f5f9' } }, item.winner)
        )
      )
    );
  }

  return el('div', { style: { height: 24 } });
}

function renderStatsCard(card: StatsCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  const titleFontSize = card.title.length > 34 ? 46 : 54;

  return cardShell(
    backgroundSrc,
    BLUE_ACCENT,
    0.68,
    [
      [0, 1],
      [42, 1],
      [60, 0.9],
      [78, 0.45],
      [100, 0.2],
    ],
    780,
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      logoImage(logo),
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(82,135,174,0.24)',
            border: '1px solid rgba(82,135,174,0.6)',
            color: BLUE_TEXT,
            fontSize: 18,
            fontWeight: 600,
          },
        },
        iconChart(BLUE_TEXT),
        card.badge
      )
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      el('div', { style: { fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.1 } }, card.title),
      el('div', { style: { fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 } }, card.subtitle)
    ),
    card.metrics.length > 0
      ? el(
          'div',
          { style: { display: 'flex', gap: 18 } },
          ...card.metrics.map((item) =>
            el(
              'div',
              {
                key: item.label,
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 26px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(13, 15, 18, 0.84)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  minWidth: 165,
                },
              },
              el('div', { style: { fontSize: 36, fontWeight: 700, color: '#f8fafc' } }, item.value),
              el('div', { style: { fontSize: 18, color: '#94a3b8' } }, item.label)
            )
          )
        )
      : el('div', null)
  );
}

function renderGamesCard(card: GamesCardSpec, backgroundSrc: string, logo: OgLogoAsset): ReactElement {
  const titleFontSize = card.title.length > 34 ? 46 : 54;

  return cardShell(
    backgroundSrc,
    GREEN_ACCENT,
    0.72,
    [
      [0, 1],
      [42, 1],
      [60, 0.9],
      [78, 0.42],
      [100, 0.16],
    ],
    780,
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      logoImage(logo),
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(121,155,41,0.24)',
            border: '1px solid rgba(121,155,41,0.6)',
            color: GREEN_TEXT,
            fontSize: 18,
            fontWeight: 600,
          },
        },
        iconBoard(GREEN_TEXT),
        card.badge
      )
    ),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      el('div', { style: { fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.1 } }, card.title),
      el('div', { style: { fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 } }, card.subtitle)
    ),
    card.pills.length > 0
      ? el(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 16 } },
          ...card.pills.map((label, index) =>
            el(
              'div',
              {
                key: label,
                style: {
                  padding: '14px 24px',
                  borderRadius: 12,
                  backgroundColor: index === 0 ? 'rgba(13, 15, 18, 0.86)' : 'rgba(13, 15, 18, 0.72)',
                  border: index === 0 ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.12)',
                  fontSize: index === 0 ? 24 : 22,
                  fontWeight: index === 0 ? 700 : 500,
                  color: index === 0 ? '#f8fafc' : '#cbd5e1',
                },
              },
              label
            )
          )
        )
      : el('div', null)
  );
}

function cardShell(
  backgroundSrc: string,
  accent: string,
  backgroundOpacity: number,
  fadeStops: readonly [number, number][],
  contentWidth: number,
  header: ReactElement,
  body: ReactElement,
  footer: ReactElement
): ReactElement {
  return el(
    'div',
    {
      style: {
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        display: 'flex',
        position: 'relative',
        backgroundColor: DARK_BG,
        fontFamily: 'Inter',
        color: '#f1f4f6',
        overflow: 'hidden',
      },
    },
    el('img', {
      src: backgroundSrc,
      style: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 960,
        height: OG_IMAGE_HEIGHT,
        objectFit: 'cover',
        opacity: backgroundOpacity,
      },
    }),
    svgHorizontalFade(DARK_BG, fadeStops),
    el('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: OG_IMAGE_WIDTH,
        height: 6,
        backgroundColor: accent,
      },
    }),
    el(
      'div',
      {
        style: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '50px 64px',
          width: contentWidth,
          height: OG_IMAGE_HEIGHT,
        },
      },
      header,
      body,
      footer
    )
  );
}

function logoImage(logo: OgLogoAsset): ReactElement {
  return el('img', {
    src: logo.src,
    width: logo.width,
    height: logo.height,
    style: { borderRadius: 6 },
  });
}

function svgHorizontalFade(hex: string, stops: readonly [number, number][]): ReactElement {
  return el(
    'svg',
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      viewBox: `0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}`,
      style: { position: 'absolute', top: 0, left: 0 },
    },
    el(
      'defs',
      null,
      el(
        'linearGradient',
        { id: 'fadeH', x1: '0', y1: '0', x2: '1', y2: '0' },
        ...stops.map(([offset, opacity], index) =>
          el('stop', { key: index, offset: `${offset}%`, stopColor: hex, stopOpacity: opacity })
        )
      )
    ),
    el('rect', { x: 0, y: 0, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, fill: 'url(#fadeH)' })
  );
}

function medalDot(color: string, rank: string): ReactElement {
  return el(
    'div',
    {
      style: {
        width: 26,
        height: 26,
        borderRadius: 999,
        backgroundColor: color,
        color: DARK_BG,
        fontSize: 15,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
    },
    rank
  );
}

function iconChart(color: string): ReactElement {
  return el(
    'svg',
    {
      width: 22,
      height: 22,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: 2.2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    el('path', { d: 'M3 3v18h18' }),
    el('rect', { x: 7, y: 12, width: 3, height: 6, fill: color, stroke: 'none', rx: 1 }),
    el('rect', { x: 12, y: 7, width: 3, height: 11, fill: color, stroke: 'none', rx: 1 }),
    el('rect', { x: 17, y: 10, width: 3, height: 8, fill: color, stroke: 'none', rx: 1 })
  );
}

function iconBoard(color: string): ReactElement {
  return el(
    'svg',
    {
      width: 22,
      height: 22,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: 1.8,
    },
    el('rect', { x: 3, y: 3, width: 18, height: 18, rx: 3 }),
    el('path', { d: 'M9 3v18M15 3v18M3 9h18M3 15h18', opacity: 0.45 }),
    el('circle', { cx: 9, cy: 9, r: 2.5, fill: color }),
    el('circle', { cx: 15, cy: 15, r: 2.5, fill: 'none', strokeWidth: 2 })
  );
}

function getEditionHeadingFontSize(heading: string): number {
  if (heading.length <= 12) {
    return 76;
  }

  if (heading.length <= 22) {
    return 60;
  }

  return 46;
}
