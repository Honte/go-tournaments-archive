import { createElement, ComponentType } from 'react';
import type { LogoProps } from '@/schema/event';

export async function renderEventLogoSvg(eventId: string, options: LogoProps): Promise<string> {
  // use dynamic import to avoid false error by next.js
  const { renderToReadableStream } = await import('react-dom/server');
  const { Logo } = (await import(`../../events/${eventId}/Logo`)) as {
    Logo: ComponentType<LogoProps>;
  };

  // renderToReadableStream supports async Logo components that read local assets from disk
  const stream = await renderToReadableStream(createElement(Logo, options));
  await stream.allReady;

  return new Response(stream).text();
}
