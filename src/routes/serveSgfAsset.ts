import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { loadTranslations } from '@/i18n/server';
import { generateJpg, generatePng } from '@tools/img';
import { Sgf } from '@tools/sgf';
import { generateSvg } from '@tools/svg';
import { getTournaments } from '@/data/serverApi';
import { loadGameSgfDetails } from '@/data/sgfs';

const THUMB_SIZE = 128;

export async function serveSgfAsset(event: EventContext, segments: string[]) {
  const sgfDir = `./events/${event.id}/sgf`;
  const details = path.parse(path.join(sgfDir, ...segments));

  if (!path.resolve(details.dir).startsWith(path.resolve(sgfDir))) {
    return notFound();
  }

  const sgfPath = path.resolve(path.join(details.dir, `${details.name.replace(/\.raw$/, '')}.sgf`));

  try {
    if (details.ext === '.sgf') {
      const sgf = await getSgf(event, sgfPath, details.name.endsWith('.raw'));

      return new Response(sgf, {
        headers: { 'Content-Type': 'application/x-go-sgf' },
      });
    }

    if (details.ext === '.svg') {
      const sgf = await getSgf(event, sgfPath);
      const svg = await generateSvg(sgf);

      return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    if (details.ext === '.png') {
      const sgf = await getSgf(event, sgfPath);
      const svg = await generateSvg(sgf);
      const png = await generatePng(svg, THUMB_SIZE);

      return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png' },
      });
    }

    if (details.ext === '.jpg') {
      const sgf = await getSgf(event, sgfPath);
      const svg = await generateSvg(sgf);
      const jpg = await generateJpg(svg, THUMB_SIZE);

      return new Response(new Uint8Array(jpg), {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    return notFound();
  } catch (err) {
    console.error(`Error generating ${segments.join('/')}:`, err);
    return notFound();
  }
}

export async function getSgfAssetOptions(event: EventContext) {
  const sgfDir = `./events/${event.id}/sgf`;
  const files = await fg.glob(`${sgfDir}/**/*.sgf`);

  if (!files.length) {
    return [{ path: ['imaginary-sgf'] }];
  }

  const output = [];

  if (event.generateZips) {
    for (const tournament of await getTournaments(event)) {
      if (tournament.hasSgfs) {
        output.push({ path: [`${tournament.year}.zip`] });
      }
    }
  }

  for (const file of files) {
    const details = path.parse(path.relative(sgfDir, file));

    output.push(
      {
        path: [...details.dir.split(path.sep), `${details.name}.sgf`],
      },
      {
        path: [...details.dir.split(path.sep), `${details.name}.raw.sgf`],
      }
    );

    if (event.generateSvgs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.svg`],
      });
    }

    if (event.generatePngs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.png`],
      });
    }

    if (event.generateJpgs) {
      output.push({
        path: [...details.dir.split(path.sep), `${details.name}.jpg`],
      });
    }
  }

  return output;
}

async function getSgf(event: EventContext, file: string, raw = false) {
  const content = await fs.readFile(file, 'utf-8');

  if (raw) {
    return content;
  }

  const sgfDir = `./events/${event.id}/sgf`;
  const translations = await loadTranslations(event);
  const tournaments = await getTournaments(event);
  const sgfPath = path.posix.join(...path.relative(sgfDir, file).split(path.sep));
  const sgfDetails = await loadGameSgfDetails(event, tournaments, sgfPath, translations);

  if (!sgfDetails) {
    throw new Error(`Could not find game for ${sgfPath}`);
  }

  return Sgf.clean(content, sgfDetails.props, sgfDetails.rotation);
}
