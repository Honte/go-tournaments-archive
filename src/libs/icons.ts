import EVENT from '@event';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createConverter } from 'convert-svg-to-png';
import { executablePath } from 'puppeteer';

const LOGO_PATH = path.resolve(`./events/${EVENT}/logo.svg`);
const APPLE_ICON_SIZE = 180;

export async function createSvgIconRoute() {
  const content = await fs.readFile(LOGO_PATH, 'utf-8');

  return new Response(content, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function createAppleIconRoute() {
  const converter = await createConverter({ launch: { executablePath } });
  const svg = await fs.readFile(LOGO_PATH, 'utf-8');
  const png = await converter.convert(svg, {
    width: APPLE_ICON_SIZE,
    height: APPLE_ICON_SIZE,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
