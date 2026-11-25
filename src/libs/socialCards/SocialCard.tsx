import type { ReactElement } from 'react';
import {
  cleanWhitespace,
  type CategoryWinner,
  type PodiumPlace,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_WIDTH,
} from '@/libs/metadata';
import type {
  ArchiveCardSpec,
  EditionCardSpec,
  GamesCardSpec,
  GeneralCardSpec,
  SocialLogoAsset,
  SocialRenderRequest,
  StatsCardSpec,
} from './schema';

const DARK_BG = '#15181c';
const BLUE_TEXT = '#93c5fd';

const MEDAL_COLORS = ['#fece43', '#c0c0c0', '#cd7f32'] as const;
const MEDAL_TEXT_COLORS = ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const;

type CardVariantProps<TCard> = {
  backgroundSrc: string;
  card: TCard;
  logo: SocialLogoAsset;
};

export function SocialCard({ backgroundSrc, card, logo }: SocialRenderRequest): ReactElement {
  switch (card.type) {
    case 'archive':
      return <ArchiveCard card={card} backgroundSrc={backgroundSrc} logo={logo} />;
    case 'general':
      return <GeneralCard card={card} backgroundSrc={backgroundSrc} logo={logo} />;
    case 'edition':
      return <EditionCard card={card} backgroundSrc={backgroundSrc} logo={logo} />;
    case 'stats':
      return <StatsCard card={card} backgroundSrc={backgroundSrc} logo={logo} />;
    case 'games':
      return <GamesCard card={card} backgroundSrc={backgroundSrc} logo={logo} />;
  }
}

function ArchiveCard({ backgroundSrc, card, logo }: CardVariantProps<ArchiveCardSpec>): ReactElement {
  const titleFontSize = card.title.length > 34 ? 48 : 56;
  const tags = [...card.eventAcronyms];

  if (card.extraEventsCount > 0) {
    tags.push(`+${card.extraEventsCount}`);
  }

  return (
    <CardShell
      backgroundSrc={backgroundSrc}
      backgroundOpacity={1}
      fadeStops={[
        [0, 1],
        [42, 1],
        [60, 0.9],
        [78, 0.38],
        [100, 0.14],
      ]}
      contentWidth={780}
      header={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo.src} width={logo.width} height={logo.height} />
        </div>
      }
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            {card.title}
          </div>
          <div style={{ fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 }}>{card.subtitle}</div>
        </div>
      }
      footer={
        tags.length > 0 ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tags.map((tag, index) => (
              <ArchiveTag key={`${index}-${tag}`} label={tag} />
            ))}
          </div>
        ) : (
          <div />
        )
      }
    />
  );
}

function GeneralCard({ backgroundSrc, card, logo }: CardVariantProps<GeneralCardSpec>): ReactElement {
  const titleFontSize = card.siteName.length > 36 ? 44 : 52;

  return (
    <CardShell
      backgroundSrc={backgroundSrc}
      backgroundOpacity={1}
      fadeStops={[
        [0, 1],
        [42, 1],
        [58, 0.92],
        [76, 0.38],
        [100, 0.12],
      ]}
      contentWidth={760}
      header={<EventHeader logo={logo} />}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            {card.siteName}
          </div>
          <div style={{ fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 }}>{card.subtitle}</div>
        </div>
      }
      footer={
        card.pills.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {card.pills.map((label) => (
              <GeneralPill key={label} label={label} />
            ))}
          </div>
        ) : (
          <div />
        )
      }
    />
  );
}

function EditionCard({ backgroundSrc, card, logo }: CardVariantProps<EditionCardSpec>): ReactElement {
  const headingSize = getEditionHeadingFontSize(card.heading);
  const footerWidth = card.isPairs ? 560 : 480;

  return (
    <CardShell
      backgroundSrc={backgroundSrc}
      backgroundOpacity={1}
      fadeStops={[
        [0, 1],
        [40, 1],
        [58, 0.92],
        [76, 0.38],
        [100, 0.14],
      ]}
      contentWidth={780}
      header={<EventHeader logo={logo} siteName={card.siteName} middleTitle={card.heading} />}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: headingSize, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.02em' }}>
            {card.heading}
          </div>
          {card.metaLine ? <div style={{ fontSize: 26, color: '#e2e8f0' }}>{card.metaLine}</div> : null}
          {card.statsLine ? <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 2 }}>{card.statsLine}</div> : null}
        </div>
      }
      footer={<EditionFooter card={card} width={footerWidth} />}
    />
  );
}

function StatsCard({ backgroundSrc, card, logo }: CardVariantProps<StatsCardSpec>): ReactElement {
  const titleFontSize = card.title.length > 34 ? 46 : 54;

  return (
    <CardShell
      backgroundSrc={backgroundSrc}
      backgroundOpacity={0.68}
      fadeStops={[
        [0, 1],
        [42, 1],
        [60, 0.9],
        [78, 0.45],
        [100, 0.2],
      ]}
      contentWidth={780}
      header={<EventHeader logo={logo} siteName={card.siteName} middleTitle={card.title} />}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.1 }}>{card.title}</div>
          <div style={{ fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 }}>{card.subtitle}</div>
        </div>
      }
      footer={
        card.metrics.length > 0 ? (
          <div style={{ display: 'flex', gap: 18 }}>
            {card.metrics.map((item) => (
              <StatsMetric key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
        ) : (
          <div />
        )
      }
    />
  );
}

function GamesCard({ backgroundSrc, card, logo }: CardVariantProps<GamesCardSpec>): ReactElement {
  const titleFontSize = card.title.length > 34 ? 46 : 54;

  return (
    <CardShell
      backgroundSrc={backgroundSrc}
      backgroundOpacity={0.72}
      fadeStops={[
        [0, 1],
        [42, 1],
        [60, 0.9],
        [78, 0.42],
        [100, 0.16],
      ]}
      contentWidth={780}
      header={<EventHeader logo={logo} siteName={card.siteName} middleTitle={card.title} />}
      body={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: titleFontSize, fontWeight: 700, lineHeight: 1.1 }}>{card.title}</div>
          <div style={{ fontSize: 23, color: '#cbd5e1', lineHeight: 1.4 }}>{card.subtitle}</div>
        </div>
      }
      footer={
        card.pills.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {card.pills.map((label, index) => (
              <GamesPill key={label} label={label} primary={index === 0} />
            ))}
          </div>
        ) : (
          <div />
        )
      }
    />
  );
}

type CardShellProps = {
  backgroundSrc: string;
  backgroundOpacity: number;
  fadeStops: readonly [number, number][];
  contentWidth: number;
  header: ReactElement;
  body: ReactElement;
  footer: ReactElement;
};

function CardShell({
  backgroundSrc,
  backgroundOpacity,
  fadeStops,
  contentWidth,
  header,
  body,
  footer,
}: CardShellProps): ReactElement {
  return (
    <div
      style={{
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
        display: 'flex',
        position: 'relative',
        backgroundColor: DARK_BG,
        fontFamily: 'Inter',
        color: '#f1f4f6',
        overflow: 'hidden',
      }}
    >
      <img
        src={backgroundSrc}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 960,
          height: SOCIAL_IMAGE_HEIGHT,
          objectFit: 'cover',
          opacity: backgroundOpacity,
        }}
      />
      <SvgHorizontalFade hex={DARK_BG} stops={fadeStops} />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '50px 64px',
          width: contentWidth,
          height: SOCIAL_IMAGE_HEIGHT,
        }}
      >
        {header}
        {body}
        {footer}
      </div>
    </div>
  );
}

type EventHeaderProps = {
  logo: SocialLogoAsset;
  siteName?: string;
  middleTitle?: string;
};

function EventHeader({ logo, siteName, middleTitle }: EventHeaderProps): ReactElement {
  const showSiteName = Boolean(
    siteName && (!middleTitle || cleanWhitespace(siteName) !== cleanWhitespace(middleTitle))
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <img src={logo.src} width={logo.width} height={logo.height} style={{ borderRadius: 6 }} />
      {showSiteName ? <div style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0' }}>{siteName}</div> : null}
    </div>
  );
}

function EditionFooter({ card, width }: { card: EditionCardSpec; width: number }): ReactElement {
  if (card.upcomingBadge) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        }}
      >
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            backgroundColor: 'rgba(82,135,174,0.22)',
            border: '1px solid rgba(82,135,174,0.55)',
            color: BLUE_TEXT,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {card.upcomingBadge}
        </div>
      </div>
    );
  }

  if (card.podium.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        }}
      >
        {card.podium.map((place) => (
          <PodiumRow key={`${place.rank}-${place.names}`} place={place} isPairs={card.isPairs} />
        ))}
      </div>
    );
  }

  if (card.categoryWinners.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 11,
          borderTop: '1px solid rgba(255,255,255,0.14)',
          paddingTop: 22,
          width,
        }}
      >
        {card.categoryWinners.map((item) => (
          <CategoryWinnerRow key={item.category} item={item} />
        ))}
      </div>
    );
  }

  return <div style={{ height: 24 }} />;
}

function ArchiveTag({ label }: { label: string }): ReactElement {
  return (
    <div
      style={{
        padding: '9px 18px',
        borderRadius: 10,
        backgroundColor: 'rgba(13, 15, 18, 0.84)',
        border: '1px solid rgba(255,255,255,0.16)',
        fontSize: 19,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function GeneralPill({ label }: { label: string }): ReactElement {
  return (
    <div
      style={{
        padding: '10px 18px',
        borderRadius: 10,
        backgroundColor: 'rgba(13, 15, 18, 0.82)',
        border: '1px solid rgba(255,255,255,0.16)',
        fontSize: 19,
        fontWeight: 600,
        color: '#f1f5f9',
      }}
    >
      {label}
    </div>
  );
}

function PodiumRow({ place, isPairs }: { place: PodiumPlace; isPairs: boolean }): ReactElement {
  const rankIndex = place.rank - 1;
  const fontSize = isPairs ? (place.rank === 1 ? 21 : 19) : place.rank === 1 ? 23 : 21;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize,
        fontWeight: place.rank === 1 ? 600 : 400,
        color: MEDAL_TEXT_COLORS[rankIndex] ?? '#cbd5e1',
      }}
    >
      <MedalDot color={MEDAL_COLORS[rankIndex] ?? '#94a3b8'} rank={String(place.rank)} />
      {place.names}
    </div>
  );
}

function CategoryWinnerRow({ item }: { item: CategoryWinner }): ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 21 }}>
      <div
        style={{
          padding: '2px 10px',
          borderRadius: 6,
          backgroundColor: 'rgba(254, 206, 67, 0.18)',
          border: '1px solid rgba(254, 206, 67, 0.5)',
          color: '#fece43',
          fontSize: 15,
          fontWeight: 700,
          minWidth: 54,
          textAlign: 'center',
        }}
      >
        {item.category}
      </div>
      <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.winner}</div>
    </div>
  );
}

function StatsMetric({ value, label }: { value: string; label: string }): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 26px',
        borderRadius: 12,
        backgroundColor: 'rgba(13, 15, 18, 0.84)',
        border: '1px solid rgba(255,255,255,0.14)',
        minWidth: 165,
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc' }}>{value}</div>
      <div style={{ fontSize: 18, color: '#94a3b8' }}>{label}</div>
    </div>
  );
}

function GamesPill({ label, primary }: { label: string; primary: boolean }): ReactElement {
  return (
    <div
      style={{
        padding: '14px 24px',
        borderRadius: 12,
        backgroundColor: primary ? 'rgba(13, 15, 18, 0.86)' : 'rgba(13, 15, 18, 0.72)',
        border: primary ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.12)',
        fontSize: primary ? 24 : 22,
        fontWeight: primary ? 700 : 500,
        color: primary ? '#f8fafc' : '#cbd5e1',
      }}
    >
      {label}
    </div>
  );
}

function SvgHorizontalFade({ hex, stops }: { hex: string; stops: readonly [number, number][] }): ReactElement {
  return (
    <svg
      width={SOCIAL_IMAGE_WIDTH}
      height={SOCIAL_IMAGE_HEIGHT}
      viewBox={`0 0 ${SOCIAL_IMAGE_WIDTH} ${SOCIAL_IMAGE_HEIGHT}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="fadeH" x1="0" y1="0" x2="1" y2="0">
          {stops.map(([offset, opacity], index) => (
            <stop key={index} offset={`${offset}%`} stopColor={hex} stopOpacity={opacity} />
          ))}
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={SOCIAL_IMAGE_WIDTH} height={SOCIAL_IMAGE_HEIGHT} fill="url(#fadeH)" />
    </svg>
  );
}

function MedalDot({ color, rank }: { color: string; rank: string }): ReactElement {
  return (
    <div
      style={{
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
      }}
    >
      {rank}
    </div>
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
