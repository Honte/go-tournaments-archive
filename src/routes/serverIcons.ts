import { createElement } from 'react';
import type { EventContext, LogoProps } from '@/schema/event';
import { generatePng } from '@tools/img';

const APPLE_ICON_SIZE = 180;

export async function serveAppleIconRoute(event: EventContext) {
  const svg = await renderLogo(event, { color: 'black', mode: 'favicon' });
  const png = await generatePng(svg, APPLE_ICON_SIZE);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}

export async function serveLogo(event: EventContext, color: string) {
  return new Response(await renderLogo(event, { color, mode: 'logo' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function serveFavicon(event: EventContext) {
  return new Response(await renderLogo(event, { color: 'black', mode: 'favicon' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

async function renderLogo(event: EventContext, options: LogoProps) {
  // use import this way to avoid false error by next.js
  const { renderToReadableStream } = await import('react-dom/server');

  const { Logo } = await import(`../../events/${event.id}/Logo`);

  // use this way to allow the component to do some async stuff (e.g. load png)
  const stream = await renderToReadableStream(createElement(Logo, options));
  await stream.allReady;
  const response = new Response(stream);

  return await response.text();
}
