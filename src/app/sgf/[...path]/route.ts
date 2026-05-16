import EVENT from '@event';
import EVENT_CONFIG from '@event/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { generateJpg } from '@tools/jpg';
import { generatePng } from '@tools/png';
import { Sgf } from '@tools/sgf';
import { generateSvg } from '@tools/svg';
import { getTournaments } from '@/data';
import { loadGameSgfProps } from '@/data/sgfs';

const THUMB_SIZE = 128;
const SGF_DIR = `./events/${EVENT}/sgf`;

type RouteProps = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, props: RouteProps) {
  const { path: segments } = await props.params;
  const details = path.parse(path.join(SGF_DIR, ...segments));

  if (!path.resolve(details.dir).startsWith(path.resolve(SGF_DIR))) {
    return new Response('Not Found', { status: 404 });
  }

  const sgfPath = path.resolve(path.join(details.dir, `${details.name.replace(/\.raw$/, '')}.sgf`));

  try {
    if (details.ext === '.sgf') {
      const sgf = await getSgf(sgfPath, details.name.endsWith('.raw'));

      return new Response(sgf, {
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
      const png = await generatePng(svg!, THUMB_SIZE);

      return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png' },
      });
    }

    if (details.ext === '.jpg') {
      const svg = await generateSvg(sgfPath);
      const jpg = await generateJpg(svg!, THUMB_SIZE);

      return new Response(new Uint8Array(jpg), {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (err) {
    console.error(`Error generating ${segments.join('/')}:`, err);
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

    if (EVENT_CONFIG.generateJpgs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.jpg`],
      });
    }
  }

  return output;
}

async function getSgf(file: string, raw = false) {
  const content = await fs.readFile(file, 'utf-8');

  if (raw) {
    return content;
  }

  const translations = await loadTranslations(DEFAULT_LOCALE);
  const tournaments = await getTournaments();
  const sgfPath = path.posix.join('/sgf', ...path.relative(SGF_DIR, file).split(path.sep));
  const sgfProps = await loadGameSgfProps(tournaments, sgfPath, translations);

  if (!sgfProps) {
    throw new Error(`Could not find game for ${sgfPath}`);
  }

  return Sgf.clean(content, sgfProps);
}
