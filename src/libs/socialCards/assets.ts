import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createElement } from 'react';
import sharp from 'sharp';
import type { LogoProps } from '@/schema/event';
import type { SocialLogoAsset } from './schema';

const GENERIC_BACKGROUND_PATH = path.resolve('src/assets/social-background.jpg');
const ARCHIVES_ICON_PATH = path.resolve('src/assets/archives.svg');
const FONTS_DIR = path.resolve('src/assets/fonts');

const BG_WIDTH = 960;
const BG_HEIGHT = 630;
const LOGO_TARGET_HEIGHT = 56;
const ARCHIVE_ICON_SIZE = 70;

export type SocialFontSpec = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: 'normal';
};

let cachedFontsPromise: Promise<SocialFontSpec[]> | undefined;
let cachedGenericBgPromise: Promise<string> | undefined;
let cachedArchiveLogoPromise: Promise<SocialLogoAsset> | undefined;
const eventLogoCache = new Map<string, Promise<SocialLogoAsset>>();
const eventBgCache = new Map<string, Promise<string>>();

export function loadSocialFonts(): Promise<SocialFontSpec[]> {
  if (!cachedFontsPromise) {
    cachedFontsPromise = Promise.all([
      loadFontFile('inter-400.woff', 400),
      loadFontFile('inter-600.woff', 600),
      loadFontFile('inter-700.woff', 700),
    ]);
  }

  return cachedFontsPromise;
}

export function loadGenericBackgroundDataUri(): Promise<string> {
  if (!cachedGenericBgPromise) {
    cachedGenericBgPromise = rasterizeBackgroundToDataUri(GENERIC_BACKGROUND_PATH);
  }

  return cachedGenericBgPromise;
}

export function loadEventBackgroundDataUri(eventId: string): Promise<string> {
  const existing = eventBgCache.get(eventId);

  if (existing) {
    return existing;
  }

  const bgPath = resolveEventBackgroundPath(eventId);
  const promise = bgPath ? rasterizeBackgroundToDataUri(bgPath) : loadGenericBackgroundDataUri();
  eventBgCache.set(eventId, promise);

  return promise;
}

export function loadArchiveLogoAsset(): Promise<SocialLogoAsset> {
  if (!cachedArchiveLogoPromise) {
    cachedArchiveLogoPromise = rasterizeArchivesIcon();
  }

  return cachedArchiveLogoPromise;
}

export function loadEventLogoAsset(eventId: string): Promise<SocialLogoAsset> {
  const existing = eventLogoCache.get(eventId);

  if (existing) {
    return existing;
  }

  const promise = rasterizeEventLogo(eventId);
  eventLogoCache.set(eventId, promise);

  return promise;
}

function resolveEventBackgroundPath(eventId: string): string | undefined {
  for (const extension of ['jpg', 'png']) {
    const candidate = path.resolve('events', eventId, `background.${extension}`);

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function rasterizeBackgroundToDataUri(filePath: string): Promise<string> {
  const buffer = await sharp(filePath)
    .resize(BG_WIDTH, BG_HEIGHT, { fit: 'cover', position: 'right' })
    .jpeg({ quality: 88 })
    .toBuffer();

  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function rasterizeArchivesIcon(): Promise<SocialLogoAsset> {
  const svg = await readFile(ARCHIVES_ICON_PATH, 'utf-8');
  const png = await sharp(Buffer.from(svg), { density: 300 })
    .resize(ARCHIVE_ICON_SIZE * 2, ARCHIVE_ICON_SIZE * 2)
    .png()
    .toBuffer();

  return {
    src: `data:image/png;base64,${png.toString('base64')}`,
    width: ARCHIVE_ICON_SIZE,
    height: ARCHIVE_ICON_SIZE,
  };
}

async function rasterizeEventLogo(eventId: string): Promise<SocialLogoAsset> {
  const { renderToReadableStream } = await import('react-dom/server');
  const { Logo } = (await import(`../../../events/${eventId}/Logo`)) as {
    Logo: React.ComponentType<LogoProps>;
  };

  const stream = await renderToReadableStream(createElement(Logo, { color: 'white', mode: 'logo' }));
  await stream.allReady;
  const svg = await new Response(stream).text();
  const png = await sharp(Buffer.from(svg), { density: 300 })
    .resize({ height: LOGO_TARGET_HEIGHT * 2 })
    .png()
    .toBuffer();
  const metadata = await sharp(png).metadata();

  return {
    src: `data:image/png;base64,${png.toString('base64')}`,
    width: Math.round((metadata.width ?? LOGO_TARGET_HEIGHT * 2) / 2),
    height: Math.round((metadata.height ?? LOGO_TARGET_HEIGHT * 2) / 2),
  };
}

async function loadFontFile(fileName: string, weight: 400 | 600 | 700): Promise<SocialFontSpec> {
  const buffer = await readFile(path.join(FONTS_DIR, fileName));
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  return {
    name: 'Inter',
    data: arrayBuffer,
    weight,
    style: 'normal',
  };
}
