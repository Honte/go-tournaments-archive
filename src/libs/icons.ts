import type { LogoProps } from '@event/schema';
import { createElement } from 'react';
import { generatePng } from '@tools/img';

const APPLE_ICON_SIZE = 180;

export async function createAppleIconRoute() {
  const svg = await renderLogo({ color: 'black', mode: 'favicon' });
  const png = await generatePng(svg, APPLE_ICON_SIZE);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}

export async function createLogoRoute(color: string) {
  return new Response(await renderLogo({ color, mode: 'logo' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function createFaviconRoute() {
  return new Response(await renderLogo({ color: 'black', mode: 'favicon' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

async function renderLogo(options: LogoProps) {
  // use import this way to avoid false error by next.js
  const { renderToReadableStream } = await import('react-dom/server');

  const { Logo } = await import('@event/Logo');

  // use this way to allow the component to do some async stuff (e.g. load png)
  const stream = await renderToReadableStream(createElement(Logo, options));
  await stream.allReady;
  const response = new Response(stream);

  return await response.text();
}
