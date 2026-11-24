import type { EventContext } from '@/schema/event';
import { generatePng } from '@tools/img';
import { renderEventLogoSvg } from '@/libs/logo';

const APPLE_ICON_SIZE = 180;

export async function serveAppleIconRoute(event: EventContext) {
  const svg = await renderEventLogoSvg(event.id, { color: 'black', mode: 'favicon' });
  const png = await generatePng(svg, APPLE_ICON_SIZE);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}

export async function serveLogo(event: EventContext, color: string) {
  return new Response(await renderEventLogoSvg(event.id, { color, mode: 'logo' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}

export async function serveFavicon(event: EventContext) {
  return new Response(await renderEventLogoSvg(event.id, { color: 'black', mode: 'favicon' }), {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}
