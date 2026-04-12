import EVENT from '@event';
import EVENT_CONFIG from '@event/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanSgf } from '@tools/sgf';
import { generateSvg } from '@tools/svg';
import { createConverter } from 'convert-svg-to-png';
import fg from 'fast-glob';
import type { NextRequest } from 'next/server';
import { generatePng } from '@tools/png';

const PNG_SIZE = 512;
const SGF_DIR = `./events/${EVENT}/sgf`;

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

let converter: Awaited<ReturnType<typeof createConverter>> | undefined;

export async function GET(request: NextRequest, props: RouteProps) {
  const { path: segments } = await props.params;
  const details = path.parse(path.join(SGF_DIR, ...segments));

  if (!path.resolve(details.dir).startsWith(path.resolve(SGF_DIR))) {
    return new Response('Not Found', { status: 404 });
  }

  const sgfPath = path.resolve(path.join(details.dir, `${details.name.replace(/\.raw$/, '')}.sgf`));

  try {
    if (details.ext === '.sgf') {
      const content = await fs.readFile(sgfPath, 'utf-8');

      return new Response(details.name.endsWith('.raw') ? content : cleanSgf(content), {
        headers: { 'Content-Type': 'application/x-go-sgf' },
      });
    }

    if (details.ext === '.svg') {
      const svg = await generateSvg(sgfPath);

      return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    if (details.ext === '.png') {
      const svg = await generateSvg(sgfPath);
      const png = await generatePng(svg!, PNG_SIZE);

      return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png' },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (err) {
    return new Response('Not Found', { status: 404 });
  }
}

export async function generateStaticParams() {
  const files = await fg.glob(`${SGF_DIR}/**/*.sgf`);

  if (!files.length) {
    return [{ path: ['imaginary-sgf'] }];
  }

  const output = [];

  for (const file of files) {
    const details = path.parse(path.relative(SGF_DIR, file));

    output.push(
      {
        path: [...details.dir.split(path.sep), `${details.name}.sgf`],
      },
      {
        path: [...details.dir.split(path.sep), `${details.name}.raw.sgf`],
      }
    );

    if (EVENT_CONFIG.generateSvgs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.svg`],
      });
    }

    if (EVENT_CONFIG.generatePngs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.png`],
      });
    }
  }

  return output;
}
